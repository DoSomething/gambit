'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

const logger = require('../lib/logger');

mongoose.Promise = Promise;
/**
 * @see http://mongoosejs.com/docs/4.x/docs/index.html
 * @see http://mongoosejs.com/docs/4.x/docs/api.html#index_Mongoose-connect
 */
module.exports = url => mongoose.connect(url, {
  // http://mongoosejs.com/docs/connections.html#use-mongo-client
  useMongoClient: true,
}).catch((error) => {
  logger.error(error.message);
  // We can't connect to the MongoDB, kill the process immediately so it can restart
  process.exit(1);
});
