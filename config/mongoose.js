'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;

module.exports = url => mongoose.connect(url, {
  // http://mongoosejs.com/docs/connections.html#use-mongo-client
  useMongoClient: true,
});
