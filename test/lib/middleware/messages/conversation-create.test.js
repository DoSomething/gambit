'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../lib/helpers');
const analyticsHelper = require('../../../../lib/helpers/analytics');
const Conversation = require('../../../../app/models/Conversation');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createConversation = require('../../../../lib/middleware/messages/conversation-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockConversation = conversationFactory.getValidConversation();
const conversationCreateStub = Promise.resolve(mockConversation);
const conversationCreateFailStub = Promise.reject({ status: 500 });

test.beforeEach((t) => {
  sandbox.stub(analyticsHelper, 'addCustomAttributes')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.platform = stubs.getPlatform();
  t.context.req.userId = stubs.getUserId();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('createConversation should inject a conversation into the req object when successfully creating a new conversation', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(Conversation, 'createForUserIdAndPlatform')
    .returns(conversationCreateStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('conversation');
  const conversation = t.context.req.conversation;
  const properties = ['_id', 'topic', 'createdAt', 'updatedAt', 'paused'];
  properties.forEach(property => conversation.should.have.property(property));
  conversation.platform.should.be.equal(t.context.req.platform);
  conversation.userId.should.be.equal(t.context.req.userId);
  analyticsHelper.addCustomAttributes.should.have.been.called;
  next.should.have.been.called;
});

test('createConversation sends sendErrorResponse on create Conversation error', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(Conversation, 'createForUserIdAndPlatform')
    .returns(conversationCreateFailStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addCustomAttributes.should.not.have.been.called;
  next.should.not.have.been.called;
});
