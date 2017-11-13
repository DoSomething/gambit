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
const analyticsHelper = require('../../../lib/helpers/analytics');
const Conversation = require('../../../app/models/Conversation');
const stubs = require('../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createConversation = require('../../../lib/middleware/conversation-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockConversation = stubs.middleware.createConversation.getConversationFromCreate();
const conversationCreateStub = Promise.resolve(mockConversation);
const conversationCreateFailStub = Promise.reject({ status: 500 });

// Setup!
test.beforeEach((t) => {
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  sandbox.stub(analyticsHelper, 'addParameters')
    .returns(underscore.noop);

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
  sandbox.stub(Conversation, 'createFromReq').returns(conversationCreateStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('conversation');
  const conversation = t.context.req.conversation;
  // We can't test object equality with middleware.createConversation.getConversationFromCreate())
  // because we currently can't pass the createdAt and updatedAt fields that get auto-set.
  const properties = ['_id', 'topic', 'createdAt', 'updatedAt'];
  properties.forEach(property => conversation.should.have.property(property));
  conversation.platform.should.be.equal(t.context.req.platform);
  conversation.platformUserId.should.be.equal(t.context.req.platformUserId);
  analyticsHelper.addParameters.should.have.been.called;
  next.should.have.been.called;
});


test('createConversation should call sendErrorResponse when posting new users fails', async (t) => {
  // setup
  const next = sinon.stub();
  sandbox.stub(Conversation, 'createFromReq').returns(conversationCreateFailStub);
  sandbox.stub(helpers, 'sendErrorResponse').returns(sendErrorResponseStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addParameters.should.not.have.been.called;
  next.should.not.have.been.called;
});
