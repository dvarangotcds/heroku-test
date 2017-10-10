import * as sequelize from 'sequelize'

export interface IRentOfferAttributes {
  id?: sequelize.DataTypeUUIDv1
  orderId: sequelize.DataTypeUUIDv1
  userId: sequelize.DataTypeUUIDv1
  itemId?: sequelize.DataTypeUUIDv1
  amount: number
  status: string
  paymentId?: string
  order?: Object
  user?: Object
  item?: Object
}

export interface IRentOfferInstance extends sequelize.Instance<IRentOfferAttributes>, IRentOfferAttributes {
  dataValues: IRentOfferAttributes
}

export interface IRentOfferModel extends sequelize.Model<IRentOfferInstance, IRentOfferAttributes> {}

export function define(sequelizeInstance: sequelize.Sequelize): IRentOfferModel {
  const schema = {
    id: {
      primaryKey: true,
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1
    },
    itemId: {
      type: sequelize.UUID,
      allowNull: true
    },
    orderId: {
      type: sequelize.UUID,
      allowNull: true
    },
    userId: {
      type: sequelize.UUID,
      allowNull: true
    },
    amount: {
      type: sequelize.FLOAT,
      defaultValue: 0
    },
    paymentId: {
      type: sequelize.STRING,
      allowNull: true
    },
    status: {
      type: sequelize.ENUM,
      values: ['sent', 'offered', 'accepted', 'ignored', 'rejected', 'canceled', 'completed']
    }
  }
  const options = {
    classMethods: {},
    indexes: [],
    timestamps: true
  }
  return sequelizeInstance.define<IRentOfferInstance, IRentOfferAttributes>('rent_offers', schema, options)
}
