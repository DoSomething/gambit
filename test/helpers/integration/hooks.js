'use strict';

/* eslint-disable no-param-reassign */

const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../../../app');
const appConfig = require('../../../config');
const mongooseConfig = require('../../../config/mongoose');

const helpers = require('../../../lib/helpers');

// Models
const Message = require('../../../app/models/Message');
const Conversation = require('../../../app/models/Conversation');

module.exports = {
  app: (testContext) => {
    testContext.request = supertest(app);
  },
  cache: helpers.cache,
  db: {
    connect: url => mongooseConfig(url || appConfig.dbUri),
    disconnect: () => mongoose.disconnect(),
    messages: {
      removeAll: (query = {}) => Message.remove(query),
    },
    conversations: {
      removeAll: (query = {}) => Conversation.remove(query),
    },
  },
};
