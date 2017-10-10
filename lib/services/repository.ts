import * as m from 'moment'
import * as mTz from 'moment-timezone'
import { Order, User, Notification, RentOffer, Item } from '../app/models'
import * as db from './db/models'
import { databse } from './db'
import { logger } from './logger'
import { Point } from 'geojson'
import { hash } from 'bcrypt'
import { auth as config } from './../config'

export default class Repository {
  private orders: Object
  private rentOffers: Object
  private users: Object
  private notifications: Object
  private items: Object

  constructor() {
    this.orders = {}
    this.rentOffers = {}
    this.users = {}
    this.notifications = {}
    this.items = {}
  }

  ///////////////////////////////////////////////////
  //////////////     ORDER      /////////////////////
  ///////////////////////////////////////////////////
  public async createOrderAsync(order: Order, user: User): Promise<Order> {
    const { keywords, message, canDeliver, location, dateFrom, dateTo, timezone, status, id } = order
    const userInstance = await this.getUser(`${user.id}`)
    this.users[`${user.id}`] = null

    const orderInstance = await userInstance.createOrder({
      canDeliver: canDeliver,
      dateFrom: dateFrom.format(),
      dateTo: dateTo.format(),
      keywords: keywords,
      location: location,
      message: message,
      timezone: timezone.name,
      status: status,
      id: id
    })

    orderInstance.user = userInstance
    return parseOrders([orderInstance])[0]
  }

  public async getOrderAsync(orderId: string, user: User): Promise<Order> {
    try {
      const orderInstance = await this.getOrder(orderId)
      return parseOrders([orderInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getUserOrdersAsync(user: User, { pageNumber = 0, pageSize = 10, filter = '' } = {}): Promise<any[]> {
    try {
      if (filter === 'incoming') {
        return await this.getUserOrdersIncomingAsync(user, { pageNumber, pageSize })
      } else {
        return await this.getUserOrdersOutgoingAsync(user, { pageNumber, pageSize })
      }
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getUserOrdersOutgoingAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<Order[]> {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      const ordersInstances: any[] = await databse.sequelize.query(
        `
              SELECT
                o.id,
                "o"."userId",
                o.can_deliver,
                o.message,
                o.keywords,
                o.date_from,
                o.date_to,
                o.location,
                o.timezone,
                o.status,
                o.updated_at,
                "u"."id" as "user.id",
                "u"."first_name" as  "user.first_name",
                "u"."last_name" as "user.last_name",
                "u"."email" as "user.email",
                "u"."password" as "user.password",
                "u"."s3_path" as "user.s3_path",
                "u"."keywords" as "user.keywords",
                "u"."pictureURL" as "user.pictureURL",
                "u"."device_tokens" as "user.device_tokens",
                COUNT(*) as "total",
                SUM (CASE WHEN rf.status = 'sent' then 1 else 0 end) as "sent",
                SUM (CASE WHEN rf.status = 'offered' then 1 else 0 end) as "offered",
                SUM (CASE WHEN rf.status = 'accepted' then 1 else 0 end) as "accepted",
                SUM (CASE WHEN rf.status = 'ignored' then 1 else 0 end) as "ignored",
                SUM (CASE WHEN rf.status = 'rejected' then 1 else 0 end) as "rejected"
              FROM orders as o, users as u, rent_offers as rf
              WHERE "u"."id" = "o"."userId" AND "rf"."orderId" = "o"."id"
              GROUP BY o.id, u.id
              ORDER BY o.updated_at desc
              LIMIT :pageSize
              OFFSET :pageNumber`,
        {
          replacements: { pageSize: pageSize, pageNumber: pageNumber },
          model: db.Order,
          raw: true,
          nest: true
        }
      )

      return parseOrders(ordersInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getOrdersFeedAsync(user: User, { pageNumber = 0, pageSize = 10, filter = '' } = {}): Promise<Order[]> {
    try {
      let attributes = {
        limit: pageSize,
        offset: pageNumber,
        include: [db.User],
        order: [['updated_at', 'DESC']]
      }
      let orderInstances: db.order.IOrderInstance[] = []

      if (filter === 'pending') {
        attributes['where'] = { status: 'pending' }
        orderInstances = await db.Order.findAll(attributes)
      } else if (filter === 'unmet') {
        orderInstances = await databse.sequelize.query(
          ` SELECT  "orders"."id" as "id",
                      "orders"."userId" as "userId",
                      "orders"."can_deliver" as "canDeliver",
                      "orders"."date_from" as "dateFrom",
                      "orders"."date_to" as "dateTo",
                      "orders"."keywords" as "keywords",
                      "orders"."location" as "location",
                      "orders"."message" as "message",
                      "orders"."timezone" as "timezone",
                      "orders"."status" as "status",
                      "users"."id" as "user.id",
                      "users"."first_name" as  "user.first_name",
                      "users"."last_name" as "user.last_name",
                      "users"."email" as "user.email",
                      "users"."password" as "user.password",
                      "users"."s3_path" as "user.s3_path",
                      "users"."keywords" as "user.keywords",
                      "users"."pictureURL" as "user.pictureURL",
                      "users"."device_tokens" as "user.device_tokens"
              FROM "orders", "users"
              WHERE "users"."id" = "orders"."userId" AND "orders"."id" NOT IN
              (SELECT "rent_offers"."orderId" FROM "rent_offers" GROUP BY "orderId")
              LIMIT :pageSize
              OFFSET :pageNumber`,
          {
            replacements: { pageSize: pageSize, pageNumber: pageNumber },
            model: db.Order,
            raw: true,
            nest: true
          }
        )
      }

      return parseOrders(orderInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getkeywordsInOrdersAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<any[]> {
    const orderInstances = await db.Order.findAll({ limit: pageSize, offset: pageNumber * pageSize })
    let keywords = {}
    orderInstances.map(orderInstance => {
      return orderInstance.keywords.map(keyword => {
        if (keywords.hasOwnProperty(keyword)) {
          keywords[keyword]++
        } else {
          keywords[keyword] = 1
        }
      })
    })
    const sorted = Object.keys(keywords).sort((a, b) => keywords[b] - keywords[a])

    sorted.forEach(x => console.log(x + ': ' + keywords[x]))
    return sorted
  }

  public async getItemsInRentOffersAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<{}> {
    const rentOfferInstances = await db.RentOffer.findAll({
      where: { status: 'completed' },
      limit: pageSize,
      offset: pageNumber * pageSize,
      order: [['updated_at', 'DESC']]
    })
    let items = {}
    let pepe = await Promise.all(
      rentOfferInstances.map(async rentOffer => {
        if (rentOffer.itemId) {
          let itemInstance = await db.Item.findOne({
            where: { id: rentOffer.itemId },
            limit: pageSize,
            offset: pageNumber * pageSize
          })
          if (itemInstance) {
            let keywords = itemInstance.keywords
            let pictures = itemInstance.pictures
            return keywords.map(async key => {
              if (items.hasOwnProperty(key)) {
                let pics = items[key].pictures.concat(pictures)
                let cant = items[key].cant + 1
                items[key] = {
                  cant: cant,
                  pictures: pics
                }
              } else {
                items[key] = {
                  cant: 1,
                  pictures: pictures
                }
              }
              return items
            })
          }
        }
      })
    )

    let aux: any[] = []
    for (var prop in items) {
      items[prop].name = prop
      aux.push(items[prop])
    }

    const sorted = aux.sort(function(a, b) {
      return b.cant < a.cant ? -1 : b.cant > a.cant ? 1 : 0
    })

    return sorted
  }

  public async getUserOrdersIncomingAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<any[]> {
    try {
      let orderInstances: db.order.IOrderInstance[] = await databse.sequelize.query(
        ` SELECT  "orders"."id" as "id",
                    "orders"."userId" as "userId",
                    "orders"."can_deliver" as "canDeliver",
                    "orders"."date_from" as "dateFrom",
                    "orders"."date_to" as "dateTo",
                    "orders"."keywords" as "keywords",
                    "orders"."location" as "location",
                    "orders"."message" as "message",
                    "orders"."timezone" as "timezone",
                    "orders"."status" as "status",
                    "orders"."updated_at" as "updated_at",
                    "users"."id" as "user.id",
                    "users"."first_name" as  "user.first_name",
                    "users"."last_name" as "user.last_name",
                    "users"."email" as "user.email",
                    "users"."password" as "user.password",
                    "users"."s3_path" as "user.s3_path",
                    "users"."keywords" as "user.keywords",
                    "users"."pictureURL" as "user.pictureURL",
                    "users"."device_tokens" as "user.device_tokens",
                    "rent_offers"."status" as "rent_offer.status",
                    "rent_offers"."id" as "rent_offer.id"
            FROM "orders", "users", (SELECT "rent_offers"."id" as "id", "rent_offers"."orderId" as "orderId", "rent_offers"."status" as "status" FROM "rent_offers" WHERE "rent_offers"."userId" = :userId) as "rent_offers"
            WHERE "orders"."id" = "rent_offers"."orderId"
            AND "users"."id" = "orders"."userId"
            ORDER BY "orders"."updated_at"
            LIMIT :pageSize
            OFFSET :pageNumber`,
        {
          replacements: { pageSize: pageSize, pageNumber: pageNumber, userId: user.id },
          model: db.Order,
          raw: true,
          nest: true
        }
      )

      return parseOrders(orderInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async createUserAsync(userJSON: any): Promise<User> {
    try {
      const userInstance = await db.User.create(userJSON)

      return parseUsers([userInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getUserAsync(userId: string): Promise<User> {
    try {
      const userInstance = await this.getUser(userId)
      this.addUsersToCache([userInstance])
      return parseUsers([userInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async updateUserAsync(userJson: any, user: User) {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      let toUpdate: any = {}
      if (userJson.email) toUpdate.email = userJson.email
      if (userJson.firstName) toUpdate.first_name = userJson.firstName
      if (userJson.lastName) toUpdate.last_name = userJson.lastName
      if (userJson.password) toUpdate.password = await hash(userJson.password, config.saltingRounds)
      if (userJson.s3_path) toUpdate.s3_path = userJson.s3_path
      if (userJson.keywords) toUpdate.keywords = userJson.keywords
      if (userJson.pictureURL) toUpdate.pictureURL = userJson.pictureURL
      if (userJson.pictureURL) toUpdate.pictureURL = userJson.pictureURL
      if (userJson.hasOwnProperty('token')) toUpdate.token = userJson.token
      if (userJson.hasOwnProperty('isVerified')) toUpdate.is_verified = userJson.isVerified
      return await userInstance.updateAttributes(toUpdate)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async findUsersAsync(condition: any): Promise<User[]> {
    try {
      const userInstances = await db.User.findAll({ where: condition })
      return parseUsers(userInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getNotificationAsync(notificationId: string, user: User): Promise<Notification> {
    try {
      const notificationInstance = await db.Notification.findOne({ where: { id: notificationId } })

      return parseNotifications([notificationInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getUserNotificationsAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<Notification[]> {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      const notificationInstances = await userInstance.getNotifications({
        limit: pageSize,
        offset: pageNumber * pageSize,
        include: [db.User],
        order: [['updated_at', 'DESC']]
      })
      return parseNotifications(notificationInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getRentOfferAsync(rentOfferId: string, user: User): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(rentOfferId)

      return parseRentOffers([rentOfferInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getItemAsync(itemId: string, user: User): Promise<Item> {
    try {
      const itemInstance = await this.getItem(itemId)
      return parseItems([itemInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async createItemAsync(jsonItem: any, user: User): Promise<Item> {
    const userInstance = await this.getUser(`${user.id}`)
    this.users[`${user.id}`] = null
    const locationAux: Point = {
      coordinates: jsonItem.location,
      type: 'Point'
    }
    jsonItem.location = locationAux

    try {
      const itemInstance = await userInstance.createItem(jsonItem)
      itemInstance.user = userInstance
      console.log('itemInstance', itemInstance)
      return parseItems([itemInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async getUserItemsAsync(user: User, { pageNumber = 0, pageSize = 10 } = {}): Promise<Item[]> {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      const itemInstances = await userInstance.getItems({
        limit: pageSize,
        offset: pageNumber * pageSize,
        order: [['updated_at', 'DESC']],
        include: [db.User]
      })
      console.log('item instance', itemInstances)
      return parseItems(itemInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async createRentOfferAsync(rentOfferJson, userId): Promise<RentOffer> {
    let rentOfferInstance = await db.RentOffer.create({ ...rentOfferJson, userId })
    rentOfferInstance = await this.getRentOffer(`${rentOfferInstance.id}`)
    return parseRentOffers([rentOfferInstance])[0]
  }

  public async getUserRentOffersAsync(
    user: User,
    { pageNumber = 0, pageSize = 10, filter = '' } = {}
  ): Promise<RentOffer[]> {
    try {
      let include: any[] = []
      include = [{ model: db.User, as: 'user' }, { model: db.Item, as: 'item', include: [db.User] }]
      let attributes = {
        limit: pageSize,
        offset: pageNumber,
        include: include,
        order: [['updated_at', 'DESC']]
      }

      if (filter === 'incoming') {
        attributes['include'].push({
          model: db.Order,
          as: 'order',
          where: { userId: user.id },
          include: [db.User]
        })
      } else if (filter === 'outgoing') {
        attributes['where'] = { userId: user.id, itemId: { $ne: null } }
        attributes['include'].push({
          model: db.Order,
          as: 'order',
          include: [db.User]
        })
      } else {
        attributes['where'] = { userId: user.id }
        attributes['include'].push({
          model: db.Order,
          as: 'order',
          include: [db.User]
        })
      }

      const rentOfferInstances = await db.RentOffer.findAll(attributes)
      return parseRentOffers(rentOfferInstances)
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async addKeywordsAsync(newKeywords: string[], user: User): Promise<User> {
    try {
      let keywordsOld = user.keywords
      let keywordsNew = newKeywords.concat(keywordsOld)
      const userInstance = await this.getUser(`${user.id}`)
      const userUpdate = await userInstance.updateAttributes({
        keywords: keywordsNew
      })

      return parseUsers([userUpdate])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async addDeviceToken(deviceToken: string, user: User): Promise<User> {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      let deviceTokens =
        user.deviceTokens && user.deviceTokens.indexOf(deviceToken.toString()) < 0
          ? user.deviceTokens.concat([deviceToken.toString()])
          : [deviceToken.toString()]

      if (deviceTokens.length <= 0) throw new Error('Invalid device token')

      const userUpdate = await userInstance.updateAttributes({
        device_tokens: deviceTokens
      })

      return parseUsers([userUpdate])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async removeDeviceToken(deviceToken: string, user: User): Promise<User> {
    try {
      const userInstance = await this.getUser(`${user.id}`)
      if (user.deviceTokens.indexOf(deviceToken.toString()) < 0) throw new Error('Invalid device token')

      user.deviceTokens.splice(user.deviceTokens.indexOf(deviceToken.toString()), 1)

      const userUpdate = await userInstance.updateAttributes({
        device_tokens: user.deviceTokens
      })

      return parseUsers([userUpdate])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async updateItemAsync(item: Item, jsonItem: any, user: User): Promise<Item> {
    try {
      const itemInstance = await this.getItem(`${item.id}`)
      const updatedItemInstance = await itemInstance.update(jsonItem)

      return parseItems([updatedItemInstance])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async removeItemAsync(item: Item, user: User): Promise<void> {
    try {
      const itemInstance = await this.getItem(`${item.id}`)
      const rentOffers = await db.RentOffer.findAll({ where: { itemId: itemInstance.id } })
      if (rentOffers.length === 0) {
        return await itemInstance.destroy()
      } else {
        throw new Error('Item can not be deleted')
      }
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  private addUsersToCache(users: db.user.IUserInstance[]) {
    for (var i = 0; i < users.length; i++) {
      var user = users[i]
      this.users[`${user.id}`] = user
    }
  }

  private async getUser(userId: string): Promise<any> {
    try {
      let user = this.users[`${userId}`]
      if (!user) {
        user = await db.User.findOne({ where: { id: userId } })
      }

      return Promise.resolve(user)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private async getItem(itemId: string): Promise<any> {
    try {
      let item = this.items[`${itemId}`]
      if (!item) {
        item = await db.Item.findOne({
          where: { id: itemId },
          include: [db.User]
        })
      }

      return Promise.resolve(item)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private async getOrder(orderId: string): Promise<any> {
    try {
      let order = this.orders[`${orderId}`]
      if (!order) {
        order = await db.Order.findOne({
          where: { id: orderId },
          include: [db.User]
        })
      }

      return Promise.resolve(order)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private async getRentOffer(rentOfferId: string): Promise<any> {
    try {
      let rentOffer = this.rentOffers[`${rentOfferId}`]
      if (!rentOffer) {
        rentOffer = await db.RentOffer.findOne({
          where: { id: rentOfferId },
          include: [
            { model: db.Order, as: 'order', include: [db.User] },
            db.User,
            { model: db.Item, as: 'item', include: [db.User] }
          ]
        })

        if (!rentOffer) throw new Error('Rent Offer not found')
      }

      return Promise.resolve(rentOffer)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  public async rejectRentOfferAsync(rentOffer: RentOffer): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(`${rentOffer.id}`)
      const rentOfferInstanceUpd = await rentOfferInstance.updateAttributes({
        status: 'rejected'
      })
      var message = 'Your offer was rejected'

      if (rentOfferInstance.order.user.firstName && rentOfferInstance.order.user.lastName)
        message = `${rentOfferInstance.order.user.firstName} ${rentOfferInstance.order.user
          .lastName} rejected your offer`

      const notifications = db.Notification.create({
        userId: rentOfferInstanceUpd.userId,
        type: 'rejected_offer',
        message: message,
        read: false,
        title: 'Rejected',
        referenceId: rentOffer.id,
        picture: rentOfferInstance.item ? rentOfferInstance.item.pictures[0] : rentOfferInstance.order.user.pictureURL
      })

      return parseRentOffers([rentOfferInstanceUpd])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async ignoreRentOfferAysnc(rentOffer: RentOffer): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(`${rentOffer.id}`)
      const rentOfferInstanceUpd = await rentOfferInstance.updateAttributes({
        status: 'ignored'
      })

      var message = 'Your rent offer was ignored'

      if (rentOfferInstance.order.user.first_name && rentOfferInstance.order.user.last_name)
        message = `${rentOfferInstance.order.user.first_name} ${rentOfferInstance.order.user
          .last_name} ignored your rent offer`

      db.Notification.create({
        userId: rentOfferInstanceUpd.order.userId,
        type: 'ignored_offer',
        message: message,
        read: false,
        title: 'Ignored',
        referenceId: rentOffer.id,
        picture: rentOfferInstance.item ? rentOfferInstance.item.pictures[0] : rentOfferInstance.order.user.pictureURL
      })

      return parseRentOffers([rentOfferInstanceUpd])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async acceptRentOfferAsync(rentOffer: RentOffer): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(`${rentOffer.id}`)
      const rentOfferInstanceUpd = await rentOfferInstance.updateAttributes({
        status: 'accepted'
      })

      var message = 'Your offer was accepted'

      if (rentOfferInstance.order.user.first_name && rentOfferInstance.order.user.last_name)
        message = `${rentOfferInstance.order.user.first_name} ${rentOfferInstance.order.user
          .last_name} accepted your rent offer`

      db.Notification.create({
        userId: rentOfferInstanceUpd.userId,
        type: 'accepted_offer',
        message: message,
        read: false,
        title: 'Accepted',
        referenceId: rentOffer.id,
        picture: rentOfferInstance.item ? rentOfferInstance.item.pictures[0] : rentOfferInstance.order.user.pictureURL
      })
      const orderInstance = rentOfferInstance.order as db.order.IOrderInstance
      const orderInstanceUpdated = await db.Order.update(
        {
          status: 'completed',
          canDeliver: orderInstance.canDeliver,
          dateFrom: orderInstance.dateFrom,
          dateTo: orderInstance.dateTo,
          keywords: orderInstance.keywords,
          location: orderInstance.location,
          message: orderInstance.message,
          timezone: orderInstance.timezone
        },
        {
          fields: ['status'],
          where: { id: rentOfferInstance.orderId },
          returning: true
        }
      )

      return parseRentOffers([rentOfferInstanceUpd])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async replyRentOfferAsync(rentOffer: RentOffer, itemId: string, amount: Number): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(`${rentOffer.id}`)
      const rentOfferInstanceUpd = await rentOfferInstance.updateAttributes({
        itemId: itemId,
        amount: amount,
        status: 'offered'
      })

      const itemInstance = await this.getItem(`${itemId}`)

      console.log(JSON.stringify(rentOfferInstance))
      const notification = db.Notification.create({
        userId: rentOfferInstance.order.userId,
        type: 'replied_offer',
        title: 'Replied',
        message: 'You have a propossal to your order',
        read: false,
        referenceId: rentOfferInstance.id,
        picture: rentOfferInstance.item ? rentOfferInstance.item.pictures[0] : rentOfferInstance.order.user.pictureURL
      })

      return parseRentOffers([rentOfferInstanceUpd])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async completeRentOfferAsync(rentOfferId: string): Promise<RentOffer> {
    try {
      const rentOfferInstance = await this.getRentOffer(`${rentOfferId}`)
      const rentOfferInstanceUpd = await rentOfferInstance.updateAttributes({
        status: 'completed'
      })

      const notification = db.Notification.create({
        userId: rentOfferInstance.order.userId,
        type: 'completed_offer',
        title: 'Completed',
        message: 'You have a completed a Rent',
        read: false,
        referenceId: rentOfferInstance.id,
        picture: rentOfferInstance.item ? rentOfferInstance.item.pictures[0] : rentOfferInstance.order.user.pictureURL
      })

      return parseRentOffers([rentOfferInstanceUpd])[0]
    } catch (error) {
      logger.error((error as Error).message)
      throw error
    }
  }

  public async cancelOrderAsync(order: Order, user: User): Promise<Order> {
    const updOrder = await this.getOrder(`${order.id}`)
    const dbUser = await this.getUser(`${user.id}`)
    const result = await db.RentOffer.update(
      { orderId: updOrder.id, status: 'canceled', amount: 0, userId: dbUser.id },
      {
        fields: ['status'],
        where: { orderId: updOrder.id },
        returning: true
      }
    )

    var message = 'Your rent offer was canceled'
    if (order.User.firstName && order.User.lastName)
      message = `${order.User.firstName} ${order.User.lastName} canceled the order`
    const notificationPromises = result[1].map(rentOfferInstance => {
      return db.Notification.create({
        userId: rentOfferInstance.userId,
        type: 'offer',
        message: message,
        read: false,
        title: 'Canceled',
        referenceId: rentOfferInstance.id,
        picture: updOrder.user.pictureURL
      })
    })

    await updOrder.updateAttributes({ status: 'canceled' })
    return parseOrders([updOrder])[0]
  }
}

function parseUsers(users: any[]): User[] {
  return users.map(user => {
    const {
      email,
      first_name,
      last_name,
      device_tokens,
      keywords,
      pictureURL,
      s3_path,
      password,
      id,
      fb_id,
      is_verified,
      token
    } = user
    return new User(
      email,
      password,
      keywords,
      device_tokens,
      s3_path,
      pictureURL,
      first_name,
      last_name,
      fb_id,
      id,
      token,
      is_verified
    )
  })
}

function parseItems(items: any[]): Item[] {
  return items.map(item => {
    const { name, description, pictures, keywords, location, id, save, s3Path, user } = item
    const User = parseUsers([user])[0] as User
    return new Item(name, description, pictures, keywords, User, location, id, s3Path)
  })
}

function parseNotifications(notifications: any[]): Notification[] {
  return notifications.map(notification => {
    const { type, title, message, read, updated_at, user, id, referenceId } = notification
    const User = parseUsers([user])[0] as User
    return new Notification(type, read, title, message, updated_at, User, referenceId, id)
  })
}

function parseOrders(orders: any[]): Order[] {
  return orders.map(order => {
    const { keywords, message, canDeliver, location, dateFrom, dateTo, timezone, status, id, user } = order
    const mDateFrom = m.tz(dateFrom, timezone)
    const mDateTo = m.tz(dateTo, timezone)
    const User = parseUsers([user])[0] as User

    return new Order(
      keywords,
      message,
      canDeliver,
      location,
      mDateFrom,
      mDateTo,
      timezone,
      status,
      User,
      id,
      order.total,
      order.sent,
      order.completed,
      order.offered,
      order.accepted,
      order.ignored,
      order.rejected,
      order.rent_offer ? order.rent_offer.id : undefined,
      order.rent_offer ? order.rent_offer.status : undefined
    )
  })
}

function parseRentOffers(rentOffers: any[]): RentOffer[] {
  return rentOffers.map(rentOffer => {
    const { amount, status, userId, orderId, id, paymentId, itemId, item, user, order } = rentOffer
    const User = parseUsers([user])[0] as User
    const Order = parseOrders([order])[0] as Order

    if (item) {
      const Item = parseItems([item])[0] as Item
      return new RentOffer(amount, status, User, Order, id, Item, paymentId)
    }
    return new RentOffer(amount, status, User, Order, id, undefined, paymentId)
  })
}

export const repository: Repository = new Repository()
