// import chai from 'chai'
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai'
// import winston from 'winston'
// import models from '../lib/app/models'

// process.env.PORT = 3000

// before((done) => {
//   chai.use(sinonChai)

//   // we want to have logger.test() without flooding the console with other levels' messages
//   winston.setLevels({
//     critical: 1,
//     debug: 5,
//     error: 2,
//     info: 4,
//     test: 0,
//     warning: 3
//   })
//   winston.addColors({
//     critical: 'red',
//     debug: 'green',
//     error: 'red',
//     info: 'cyan',
//     test: 'blue',
//     warn: 'yellow'
//   })
//   winston.remove(winston.transports.Console)
//   winston.add(winston.transports.Console, { level: process.env.LOGGER_LEVEL || 'test', colorize: true })

//   return models.db.sync();
// })

// beforeEach(function beforeEach () {
//   if (null == this.sinon) {
//     this.sinon = sinon.sandbox.create()
//   } else {
//     this.sinon.restore()
//   }
// })

// after(() => {
//   return models.db.drop().then(function() {
//     return models.db.query(`drop table if exists "SequelizeMeta"`);
//   });
// })
