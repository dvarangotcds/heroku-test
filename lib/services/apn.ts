import { Provider, ProviderOptions, Responses, ResponseFailure, Notification } from 'apn'
import { ios } from '../config'

export class Apn {
  private client: Provider
  private failed: ResponseFailure[]
  private options: ProviderOptions

  constructor() {
    this.failed = []
  }

  public init() {
    this.options = {
      token: {
        key: ios.p8FilePath,
        keyId: ios.keyId,
        teamId: ios.teamId
      },
      production: !ios.sandbox
    } as ProviderOptions
    this.client = new Provider(this.options)

    this.client.on('connected', function() {
      console.log('APN Connected')
    })
  }

  public send(badge: Number, message: string, payload: any, tokens: string[]) {
    var note

    if (tokens) {
      console.log('Will send push notification to:' + tokens)
      note = new Notification()

      note.expiry = Math.floor(Date.now() / 1000) + 3600 // Expires 1 hour from now.
      if (badge) {
        note.badge = badge
      }

      note.sound = 'ping.aiff'
      note.alert = message
      payload.messageFrom = 'Shizzal'
      note.payload = payload
      note.topic = ios.bundleIdentifier
      note.category = payload.category

      if (this.client) {
        this.client.send(note, tokens).then(result => {
          console.log('Sent push to: ' + tokens + ' with result:' + JSON.stringify(result))
        })
      }
    }
  }
}

export const apn: Apn = new Apn()
