import { DataTypeUUIDv1 } from 'sequelize'
import { common, defaultProfilePicture } from '../../config'

export default class User {
  constructor(
    public email: string,
    public password: string,
    public keywords: string[],
    public deviceTokens: string[],
    public s3Path?: string,
    public pictureURL?: string,
    public firstName?: string,
    public lastName?: string,
    public facebookId?: string,
    public id?: DataTypeUUIDv1,
    public token?: string,
    public isVerified?: boolean
  ) {}

  public getProfileUrl(): string {
    return this.pictureURL ? this.pictureURL : `${common.basePath}/assets/profile_placeholder.png`
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
