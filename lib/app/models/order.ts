import { Point } from 'geojson'
import * as m from 'moment'
import * as mTz from 'moment-timezone'
import User from './user'
import { DataTypeUUIDv1 } from 'sequelize'

export default class Order {
  constructor(
    public keywords: string[],
    public message: string,
    public canDeliver: boolean,
    public location: Point,
    public dateFrom: m.Moment,
    public dateTo: m.Moment,
    public timezone: mTz.MomentZone,
    public status: string,
    public User: User,
    public id?: DataTypeUUIDv1,
    public totalCount?: number,
    public sentCount?: number,
    public completedCount?: number,
    public offeredCount?: number,
    public acceptedCount?: number,
    public ignoredCount?: number,
    public rejectededCount?: number,
    public rentOfferId?: DataTypeUUIDv1,
    public rentOfferStatus?: string
  ) {}
}
