import { Point } from 'geojson'
import * as m from 'moment'
import * as mTz from 'moment-timezone'
import * as sequelize from 'sequelize'
import { IRentOfferAttributes } from './rent_offer'

export interface IOrderAttributes {
  id?: sequelize.DataTypeUUIDv1
  userId?: sequelize.DataTypeUUIDv1
  canDeliver: boolean
  dateFrom: string
  dateTo: string
  keywords: string[]
  location: Point
  message: string
  timezone: string
  status: string
  user?: Object
}

export interface IOrderInstance extends sequelize.Instance<IOrderAttributes>, IOrderAttributes {
  dataValues: IOrderAttributes
  getOrders: sequelize.HasManyGetAssociationsMixin<IOrderAttributes>
  getRentOffers: sequelize.HasManyGetAssociationsMixin<IRentOfferAttributes>
}

export interface IOrderModel extends sequelize.Model<IOrderInstance, IOrderAttributes> {}

export function define(sequelizeInstance: sequelize.Sequelize): IOrderModel {
  const schema = {
    id: {
      primaryKey: true,
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1
    },
    userId: {
      type: sequelize.UUID,
      allowNull: true
    },
    canDeliver: {
      allowNull: false,
      field: 'can_deliver',
      type: sequelize.BOOLEAN
    },
    message: {
      allowNull: false,
      type: sequelize.STRING
    },
    keywords: {
      allowNull: false,
      type: sequelize.ARRAY(sequelize.STRING)
    },
    dateFrom: {
      allowNull: false,
      field: 'date_from',
      type: sequelize.DATE
    },
    dateTo: {
      allowNull: false,
      field: 'date_to',
      type: sequelize.DATE
    },
    location: {
      allowNull: false,
      type: sequelize.GEOMETRY('POINT')
    },
    timezone: {
      allowNull: false,
      type: sequelize.STRING
    },
    status: {
      type: sequelize.ENUM,
      values: ['canceled', 'pending', 'completed']
    }
  }
  const options = {
    classMethods: {},
    indexes: [],
    timestamps: true
  }
  return sequelizeInstance.define<IOrderInstance, IOrderAttributes>('orders', schema, options)
}
