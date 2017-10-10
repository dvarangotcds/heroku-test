import * as sequelize from 'sequelize'
import * as order from './order'
import * as user from './user'
import * as notification from './notification'
import * as item from './item'
import * as rent_offer from './rent_offer'
import { keywordsSuggester } from '../../keywords_suggester'
import { apn } from '../../apn'
import { repository } from './../../repository'
import { maxRentOffersToGenerate } from './../../../config'

export let User: user.IUserModel
export let Order: order.IOrderModel
export let Notification: notification.INotificationModel
export let Item: item.IItemModel
export let RentOffer: rent_offer.IRentOfferModel

export { order, user, rent_offer, notification, item }

const MAX_KEYWORDS_TO_SUGGEST = 20

export function define(sequelizeInstance: sequelize.Sequelize) {
  User = user.define(sequelizeInstance) as user.IUserModel
  Order = order.define(sequelizeInstance) as order.IOrderModel
  Item = item.define(sequelizeInstance) as item.IItemModel
  RentOffer = rent_offer.define(sequelizeInstance) as rent_offer.IRentOfferModel
  Notification = notification.define(sequelizeInstance) as notification.INotificationModel

  // Now you will get User#getOrders
  User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' })
  Order.belongsTo(User, { foreignKey: 'userId' })

  // Now you will get User#getItems
  User.hasMany(Item, { foreignKey: 'userId', onDelete: 'CASCADE' })
  Item.belongsTo(User, { foreignKey: 'userId' })

  // Now you will get User#getNotifications
  User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' })
  Notification.belongsTo(User, { foreignKey: 'userId' })

  // Now you will get User#getRentOffers
  User.hasMany(RentOffer, { foreignKey: 'userId', onDelete: 'CASCADE' })
  RentOffer.belongsTo(User, { foreignKey: 'userId' })
  // Now you will get Order#getRentOffers
  Order.hasMany(RentOffer, { foreignKey: 'orderId', onDelete: 'CASCADE' })
  RentOffer.belongsTo(Order, { foreignKey: 'orderId' })
  // Item.hasOne(User, { foreignKey: 'User' })
  Item.hasMany(RentOffer, { foreignKey: 'itemId', onDelete: 'CASCADE' })
  RentOffer.belongsTo(Item, { foreignKey: 'itemId' })
  RentOffer.addHook('afterCreate', 'notifyUsers', async (rentOffer, options) => {
    const order = await Order.findOne({ where: { id: rentOffer.orderId }, include: [User] })
    if (order && order.user) {
      const userInstance = order.user as user.IUserInstance
      let message = `${userInstance.first_name} ${userInstance.last_name} is looking for something you might have`
      Notification.create({
        message: message,
        title: 'Rent Offer',
        userId: rentOffer.userId,
        type: 'sent_offer',
        read: false,
        referenceId: rentOffer.id
      })
    } else {
      throw new Error('Missing User Id')
    }
  })
  Order.addHook('afterCreate', 'createRentOffer', async (order, options) => {
    await keywordsSuggester.newOrderKeywords(order.keywords)
    const kws = (await keywordsSuggester.getRelatedKeywords(order.keywords, MAX_KEYWORDS_TO_SUGGEST)) as any
    User.findAll({ where: { keywords: { $overlap: kws } }, limit: maxRentOffersToGenerate }).then(users => {
      users.map(user => {
        if (order.userId !== user.id) {
          if (order.id) {
            RentOffer.create({
              status: 'sent',
              orderId: order.id,
              userId: user.id,
              user: user,
              order: order,
              amount: 0.0
            })
          } else {
            throw new Error('Missing Order Id')
          }
        }
      })
    })
  })

  Item.addHook('afterCreate', 'updateKeywords', (item, options) => {
    keywordsSuggester.newItemKeywords(item.keywords)
  })

  Notification.addHook('afterCreate', 'sendPush', async (notification, options) => {
    const user = await User.findById(notification.userId)
    if (user && user.device_tokens && user.device_tokens.length > 0) {
      const unread = await Notification.count({ where: { read: false, userId: notification.userId } })
      let category
      if (notification.type === 'sent_offer') {
        category = 'SENT_OFFER'
      }
      if (notification.type === 'replied_offer') {
        category = 'REPLIED_OFFER'
      }
      //faltaria cuando aceota ek item y tiene la opcion de pagar y cancelar
      apn.send(
        unread,
        notification.message,
        {
          referenceId: notification.referenceId,
          type: notification.type,
          category: category
        },
        user.device_tokens
      )
    }
  })
}
