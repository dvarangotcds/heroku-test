import User from './user'
import { DataTypeUUIDv1 } from 'sequelize'

export default class Notification {
  constructor(
    public type: string,
    public read: boolean,
    public title: string,
    public message: string,
    public date: Date,
    public User: User,
    public referenceId?: DataTypeUUIDv1,
    public id?: DataTypeUUIDv1
  ) {}
}
