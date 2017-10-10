import { RentOffer, Notification, Item, Order } from './models'

export function userReplacer(key, value) {
  return key === 'password' ? undefined : value
}

export function toOrderDTO(order: Order): any {
  return {
    id: order.id,
    keywords: order.keywords,
    message: order.message,
    canDeliver: order.canDeliver,
    location: order.location.coordinates,
    dateFrom: order.dateFrom,
    dateTo: order.dateTo,
    timezone: order.timezone.name,
    status: order.status,
    User: order.User,
    counters: {
      total: order.totalCount,
      accepted: order.acceptedCount,
      replied: order.acceptedCount,
      ignored: order.ignoredCount,
      sent: order.sentCount,
      rejected: order.rejectededCount,
      completed: order.completedCount
    },
    rent_offer: {
      id: order.rentOfferId,
      status: order.rentOfferStatus
    }
  }
}

export function toNotificationDTO(notification: Notification): any {
  return {
    id: notification.id,
    User: notification.User,
    type: notification.type,
    read: notification.read,
    title: notification.title,
    message: notification.message,
    referenceId: notification.referenceId,
    date: notification.date
  }
}

export function toRentOfferDTO(rentOffer: RentOffer): any {
  return {
    id: rentOffer.id,
    User: rentOffer.User,
    Order: toOrderDTO(rentOffer.Order),
    Item: toItemDTO(rentOffer.Item),
    amount: rentOffer.amount,
    status: rentOffer.status,
    paymentId: rentOffer.paymentId
  }
}

export function toItemDTO(item: Item | undefined): any {
  if (item)
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      pictures: item.pictures,
      keywords: item.keywords,
      User: item.User,
      location: item.location.coordinates,
      s3Path: item.s3Path
    }
  else return undefined
}
