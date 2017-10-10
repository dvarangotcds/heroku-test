import redis from '@mcrowe/redis-promise'
import { User } from '../app/models'
import { logger } from './logger'

export class TokensCache {
  private refreshTokens: Array<[string, string]>
  private client: any
  private readonly refreshTokenKey = 'refreshToken'
  private readonly accessTokenKey = 'accessToken'

  constructor() {
    this.refreshTokens = []
  }

  public init(redisHost: string, redisPort: number, redisPassword: string) {
    this.client = redis.createClient({ host: redisHost, password: redisPassword, port: redisPort })
  }

  public async saveOrReplaceRefreshTokenAsync(user: User, refreshToken: string) {
    await this.client.setAsync(refreshToken, `${user.id}`)
  }

  public async saveAccessTokenAsync(userId: string, accessToken: string) {
    await this.client.setAsync(accessToken, userId)
  }

  public async deleteRefreshTokenAsync(user: User): Promise<boolean> {
    return (await this.client.sremAsync(`${user.id}:${this.refreshTokenKey}`)) === 1
  }

  public async deleteAccessTokenAsync(user: User): Promise<boolean> {
    return (await this.client.sremAsync(`${user.id}:${this.accessTokenKey}`)) === 1
  }

  public async getRefreshTokenAsync(user: User): Promise<string> {
    return await this.client.getAsync(`${user.id}`)
  }

  public async getAccessTokenAsync(user: User): Promise<string> {
    return await this.client.getAsync(`${user.id}`)
  }

  public async getUserIdAsync(accessToken: string): Promise<string> {
    return await this.client.getAsync(accessToken)
  }

  public async isValidRefreshTokenAsync(refreshToken: string, user: User): Promise<boolean> {
    return (await this.client.sismemberAsync(user.id, refreshToken)) === 1
  }

  public async isValidAccessTokenAsync(accessToken: string, user: User): Promise<boolean> {
    return (await this.client.sismemberAsync(user.id, accessToken)) === 1
  }
}

export const tokensCache: TokensCache = new TokensCache()
