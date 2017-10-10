import * as sequelize from 'sequelize'
import { IRentOfferAttributes } from './rent_offer'
import { Point } from 'geojson'

export interface IItemAttributes {
  id?: sequelize.DataTypeUUIDv1
  name: string
  description: string
  pictures: string[]
  keywords: string[]
  location: Point
  userId: sequelize.DataTypeUUIDv1
  user: Object
  s3Path: string
}

export interface IItemInstance extends sequelize.Instance<IItemAttributes>, IItemAttributes {
  dataValues: IItemAttributes
  getRentOffers: sequelize.HasManyGetAssociationsMixin<IRentOfferAttributes>
}

export interface IItemModel extends sequelize.Model<IItemInstance, IItemAttributes> {}

export function define(sequelizeInstance: sequelize.Sequelize): IItemModel {
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
    name: {
      type: sequelize.STRING,
      allowNull: false
    },
    description: {
      type: sequelize.STRING,
      allowNull: false
    },
    pictures: {
      type: sequelize.ARRAY(sequelize.STRING)
    },
    keywords: {
      type: sequelize.ARRAY(sequelize.STRING)
    },
    location: {
      allowNull: false,
      type: sequelize.GEOMETRY('POINT')
    },
    s3Path: {
      type: sequelize.STRING
    }
  }
  const options = {
    classMethods: {},
    indexes: [],
    timestamps: true
  }
  return sequelizeInstance.define<IItemInstance, IItemAttributes>('items', schema, options)
}
