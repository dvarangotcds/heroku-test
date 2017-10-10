import * as sequelize from 'sequelize'

export interface INotificationAttributes {
  id?: sequelize.DataTypeUUIDv1
  userId: sequelize.DataTypeUUIDv1
  type: string
  title: string
  message: string
  read: boolean
  referenceId?: sequelize.DataTypeUUID
  User?: Object
  picture?: string
}

export interface INotificationInstance extends sequelize.Instance<INotificationAttributes>, INotificationAttributes {
  dataValues: INotificationAttributes
}

export interface INotificationModel extends sequelize.Model<INotificationInstance, INotificationAttributes> {}

export function define(sequelizeInstance: sequelize.Sequelize): INotificationModel {
  const schema = {
    id: {
      primaryKey: true,
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1
    },
    type: {
      type: sequelize.ENUM,
      values: [
        'sent_offer',
        'replied_offer',
        'ignored_offer',
        'accepted_offer',
        'rejected_offer',
        'order',
        'rent',
        'offer'
      ]
    },
    userId: {
      type: sequelize.UUID,
      allowNull: true
    },
    title: {
      type: sequelize.STRING,
      allowNull: false
    },
    message: {
      type: sequelize.STRING,
      allowNull: false
    },
    read: {
      type: sequelize.BOOLEAN,
      defaultValue: false
    },
    referenceId: {
      type: sequelize.UUID,
      allowNull: true
    },
    picture: {
      type: sequelize.STRING,
      allowNull: true
    }
  }
  const options = {
    classMethods: {},
    indexes: [],
    timestamps: true
  }
  return sequelizeInstance.define<INotificationInstance, INotificationAttributes>('notifications', schema, options)
}
