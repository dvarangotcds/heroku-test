import * as fs from 'fs'
import * as path from 'path'
import * as sequelize from 'sequelize'
import { Model, Sequelize } from 'sequelize'
import { logger } from '../'
import { db } from '../../config'
import { define as defineModels } from './models'

class Database {
  public sequelize: Sequelize

  public init() {
    const connectionOptions = { define: { underscored: true, underscoredAll: true }, timezone: '+00:00' }
    this.sequelize = new sequelize(db.getConnectionString(), connectionOptions)
    defineModels(this.sequelize)
  }
}

const database = new Database()

export async function init() {
  database.init()
  await database.sequelize.sync()
  logger.info('Database synced.')
}

export const databse: Database = database
