import Order from './order'
import User from './user'
import Item from './item'
import { DataTypeUUIDv1 } from 'sequelize'

export default class RentOffer {
  constructor(
    public amount: number,
    public status: string,
    public User: User,
    public Order: Order,
    public id?: DataTypeUUIDv1,
    public Item?: Item,
    public paymentId?: string
  ) {}
}
