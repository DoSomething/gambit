'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../lib/helpers');
const Conversation = require('../../../app/models/Conversation');
const stubs = require('../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createConversation = require('../../../lib/middleware/conversation-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubsxww
const sendErrorResponseStub = underscore.noop;
const conversationCreateStub = Promise.resolve(stubs.middleware.createConversation.getConversationFromCreate());
const conversationCreateFailStub = Promise.reject({ status: 500 });

// Setup!
test.beforeEach((t) => {
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();

  // add params
  t.context.req.platform = stubs.getPlatform();
  t.context.req.platformUserId = stubs.getPlatformUserId();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('createConversation should inject a conversation into the req object when successfully creating a new conversation', async (t) => {
  // setup
  const next = sinon.stub();
  const conversation = stubs.middleware.createConversation.getConversationFromCreate();
  sandbox.stub(Conversation, 'createFromReq').returns(conversationCreateStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.should.be.eql(conversation);
  next.should.have.been.called;
});

/*
test('createConversation should call sendErrorResponse when posting new users fails', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(User, 'post').returns(userPostFailStub);
  sandbox.stub(helpers, 'sendErrorResponse').returns(sendErrorResponseStub);
  const middleware = createNewUser();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});
*/