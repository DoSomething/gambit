'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

const logger = require('../lib/logger');

mongoose.Promise = Promise;

/**
 * @see https://mongoosejs.com/docs/index.html
 */
module.exports = url => mongoose.connect(url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((error) => {
  logger.error(error.message);
  // We can't connect to the MongoDB, kill the process immediately so it can restart
  process.exit(1);
});
