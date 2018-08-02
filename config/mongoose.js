'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;
/**
 * @see http://mongoosejs.com/docs/4.x/docs/index.html
 * @see http://mongoosejs.com/docs/4.x/docs/api.html#index_Mongoose-connect
 */
module.exports = url => mongoose.connect(url, {
  // http://mongoosejs.com/docs/connections.html#use-mongo-client
  useMongoClient: true,
});
