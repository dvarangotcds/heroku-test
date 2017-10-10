import * as sequelize from 'sequelize'
import { Order, User } from '../../../app/models'
import { IOrderAttributes, IOrderInstance } from './order'
import { INotificationAttributes, INotificationInstance } from './notification'
import { IRentOfferAttributes, IRentOfferInstance } from './rent_offer'
import { IItemAttributes, IItemInstance } from './item'

export interface IUserAttributes {
  id: sequelize.DataTypeUUIDv1
  first_name?: string
  last_name?: string
  email: string
  password: string
  s3_path: string
  keywords: string[]
  pictureURL?: string
  device_tokens: string[]
  fb_id?: string
  token?: string
  is_verified?: boolean
}

export interface IUserInstance extends sequelize.Instance<IUserAttributes>, IUserAttributes {
  createOrder: sequelize.HasManyCreateAssociationMixin<IOrderAttributes, IOrderInstance>
  createNotification: sequelize.HasManyCreateAssociationMixin<INotificationAttributes, INotificationInstance>
  createItem: sequelize.HasManyCreateAssociationMixin<IItemAttributes, IItemInstance>
  createRentOffer: sequelize.HasManyCreateAssociationMixin<IRentOfferAttributes, IRentOfferInstance>
}

export interface IUserModel extends sequelize.Model<IUserInstance, IUserAttributes> {}

export function define(sequelizeInstance: sequelize.Sequelize): IUserModel {
  const schema = {
    id: {
      primaryKey: true,
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1
    },
    first_name: {
      type: sequelize.STRING
    },
    last_name: {
      type: sequelize.STRING
    },
    password: {
      allowNull: false,
      type: sequelize.STRING
    },
    email: {
      allowNull: false,
      type: sequelize.STRING,
      unique: true
    },
    keywords: {
      type: sequelize.ARRAY(sequelize.STRING)
    },
    pictureURL: {
      type: sequelize.STRING
    },
    s3_path: {
      type: sequelize.STRING
    },
    device_tokens: {
      type: sequelize.ARRAY(sequelize.STRING)
    },
    fb_id: {
      type: sequelize.STRING
    },
    token: {
      type: sequelize.STRING
    },
    is_verified: {
      type: sequelize.BOOLEAN
    }
  }
  const options = {
    classMethods: {},
    indexes: [],
    timestamps: true
  }
  return sequelizeInstance.define<IUserInstance, IUserAttributes>('users', schema, options)
}
