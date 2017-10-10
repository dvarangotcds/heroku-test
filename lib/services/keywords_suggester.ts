import redis from '@mcrowe/redis-promise'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as WebSocket from 'ws'
import { logger } from '.././services'
import * as excel from 'excel'

const MAX_SUGGESTIONS = 20
const KEYWORDS_SET_NAME = 'shizzal_keywords_set'

export class KeywordsSuggester {
  private server: WebSocket.Server
  private client: any
  private readonly keywordsZSetName = 'keywords'
  private readonly fullWordMarker = '*'

  public init(
    server: http.Server | https.Server,
    path: string,
    redisPort: number,
    redisHost: string,
    redisPassword: string
  ) {
    this.server = new WebSocket.Server({ path, server })
    this.client = redis.createClient({ host: redisHost, password: redisPassword, port: redisPort })
    this.server.on('connection', ws => this.onConnected(ws))
  }

  public async populateRedisWithKeywords() {
    const keysCount = await this.client.keys('*')
    console.log(keysCount)
    if (keysCount) return
    const keywords = await this.client.keysAsync('*')
    await Promise.all(
      keywords.map(async keyword => {
        await this.addSortedSet(keyword)
      })
    )
    let rows = await this.loadInitialData()
    await Promise.all(rows.slice(1).map<Promise<void>>(async row => this.addExcelKeywords(row[0], row[1])))
  }

  private loadInitialData(): Promise<any[]> {
    return new Promise(function(resolve, reject) {
      excel('initialKeywords.xlsx', function(error, data) {
        if (error) reject(error)
        else resolve(data)
      })
    })
  }
  /**
   * Add new keyword with a sorted set of suggestions
   */
  private async addExcelKeywords(keyword, suggestions) {
    // Only add if it doesn't exist already
    await Promise.all(
      suggestions.split(',').map(async suggestion => {
        await this.syncKeywords(keyword, suggestion)
      })
    )
  }

  public async addKeyword(keyword, suggestions) {
    console.log(JSON.stringify(suggestions))
    for (var i = 0; i < suggestions.length; i++) {
      var suggestion = suggestions[i]
      await this.syncKeywords(keyword, suggestion)
    }
  }

  public async addSortedSet(keyword) {
    if ((await this.client.zrankAsync(KEYWORDS_SET_NAME, keyword)) === null) {
      await this.client.zaddAsync(KEYWORDS_SET_NAME, 1, keyword)
    } else {
      await this.client.zincrbyAsync(KEYWORDS_SET_NAME, 1, keyword)
    }
  }

  public async getSortedSet() {
    let sortedSet = await this.client.zrevrangeAsync(KEYWORDS_SET_NAME, 0, -1)
    return sortedSet
  }

  /**
   * Add a suggestion to a keyword
   * increments the score in the sorted set if the suggestion already exists
   */
  private async syncKeywords(keywordA, keywordB) {
    await this.addSortedSet(keywordA)
    await this.addSortedSet(keywordB)
    await this.client.zincrbyAsync(keywordA, 1, keywordB)
    await this.client.zincrbyAsync(keywordB, 1, keywordA)
  }

  public async newItemKeywords(keywords: any[]) {
    keywords.map(async keyword => {
      let suggestions = keywords.filter(key => {
        if (key !== keyword) return key
      })
      await this.addKeyword(keyword, suggestions)
    })
  }

  public async newOrderKeywords(keywords: any[]) {
    keywords.map(async keyword => {
      let suggestions = keywords.filter(key => {
        if (key !== keyword) return key
      })
      await this.addKeyword(keyword, suggestions)
    })
  }

  public async getPopularKeywordsAsync() {
    return await this.client.keysAsync('*')
  }

  public async getRelatedKeywords(keywords: string[], limit: number): Promise<string[]> {
    let kResults: any[] = await this.getScoredKeywords(keywords)
    let allResults: any[] = convertToKeyValueCollection(kResults)
    return uniq(keywords.concat(allResults.map(kresult => kresult.key))).slice(0, limit)
  }

  private async getScoredKeywords(keywords: any[]): Promise<any[]> {
    return Promise.all(keywords.map<Promise<void>>(keyword => this.client.zrevrangeAsync(keyword, 0, 10, 'withscores')))
  }

  // See http://oldblog.antirez.com/post/autocomplete-with-redis.html for algorithm explanation
  /// Websocket methods
  private onConnected(socket: WebSocket) {
    socket.on('message', message => this.onMessageReceived(socket, message))
  }

  public async getKeywordsSuggestion(keywords: any[], text: string): Promise<any[]> {
    let suggestions: any[] = []
    const keywordExist = await this.client.existsAsync(text)
    if (text && keywordExist) {
      suggestions = await this.client.zrevrangeAsync(text, 0, 15)
    } else if (text) {
      suggestions = await this.client.keysAsync(`*${text}*`)
    }

    if (suggestions.length > MAX_SUGGESTIONS) {
      return suggestions
    }

    if (keywords.length > 0) {
      let kResults: any[] = await this.getScoredKeywords(keywords)

      let allResults: any[] = convertToKeyValueCollection(kResults)

      for (let index = 0; index < allResults.length; index++) {
        if (suggestions.length > MAX_SUGGESTIONS - 1) {
          break
        }
        suggestions.push(allResults[index].key)
      }
    }

    return suggestions.filter(function(obj) {
      return keywords.indexOf(obj) < 0
    })
  }

  private async onMessageReceived(socket: WebSocket, data: WebSocket.Data) {
    const json = JSON.parse(data.toString())
    const keywords: any[] = json.keywords
    const text = json.text
    console.log('onMessageReceived: ' + JSON.stringify(json))
    try {
      const res = await this.getKeywordsSuggestion(keywords, text)
      socket.send(JSON.stringify(res))
    } catch (error) {
      logger.error(`WORD MATCH FAIL ${JSON.stringify(data)}: ${JSON.stringify(error)}`)
    }
  }
  /// End Websocket methods
}

function isOdd(num) {
  return num % 2
}

function compare(a, b) {
  if (a.score < b.score) return -1
  if (a.score > b.score) return 1
  return 0
}

function uniq(arrArg) {
  return arrArg.filter((elem, pos, arr) => {
    return arr.indexOf(elem) == pos
  })
}

/**
 * Converts a collection of results of zrevrange
 * to a sorted array of objects {key, score}
 * @param kResults array of arrays with keywords=>[kw, score]
 * @return array of {key, score} objects
 */
function convertToKeyValueCollection(kResults: any[]) {
  return kResults
    .map(subArray => {
      let pairs: any[] = []
      for (var i = 0; i < subArray.length; i++) {
        if (!isOdd(i)) {
          pairs.push({
            key: subArray[i],
            score: subArray[i + 1]
          })
        }
      }
      return pairs
    })
    .reduce((accumulator, value) => accumulator.concat(value))
    .sort(compare)
}

export const keywordsSuggester: KeywordsSuggester = new KeywordsSuggester()
