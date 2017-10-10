import User from './user'
import { DataTypeUUIDv1 } from 'sequelize'
import { Point } from 'geojson'

export default class Item {
  constructor(
    public name: string,
    public description: string,
    public pictures: string[],
    public keywords: string[],
    public User: User,
    public location: Point,
    public id?: DataTypeUUIDv1,
    public s3Path?: string
  ) {}
}
