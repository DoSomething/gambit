'use strict';

/* eslint-disable no-param-reassign */

const nock = require('nock');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../../../app');
const appConfig = require('../../../config');
const mongooseConfig = require('../../../config/mongoose');

const helpers = require('../../../lib/helpers');

// Models
const DraftSubmission = require('../../../app/models/DraftSubmission');
const Conversation = require('../../../app/models/Conversation');
const Message = require('../../../app/models/Message');

module.exports = {
  app: (testContext) => {
    testContext.request = supertest(app);
  },
  cache: helpers.cache,
  db: {
    connect: url => mongooseConfig(url || appConfig.dbUri),
    disconnect: () => mongoose.disconnect(),
    drop: () => mongoose.connection.dropDatabase(),
    messages: {
      removeAll: (query = {}) => Message.remove(query),
    },
    conversations: {
      removeAll: (query = {}) => Conversation.remove(query),
    },
    draftSubmissions: {
      removeAll: (query = {}) => DraftSubmission.remove(query),
    },
  },
  interceptor: {
    cleanAll: () => nock.cleanAll(),
  },
};
