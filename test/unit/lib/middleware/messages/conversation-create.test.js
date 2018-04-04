'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../lib/helpers');
const Conversation = require('../../../../../app/models/Conversation');
const stubs = require('../../../../helpers/stubs');
const conversationFactory = require('../../../../helpers/factories/conversation');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const createConversation = require('../../../../../lib/middleware/messages/conversation-create');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockConversation = conversationFactory.getValidConversation();
const conversationCreateStub = Promise.resolve(mockConversation);
const conversationCreateFailStub = Promise.reject({ status: 500 });

test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setConversation')
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

test('createConversation should call next if req.conversation exists', async (t) => {
  const next = sinon.stub();
  t.context.req.conversation = mockConversation;
  sandbox.stub(Conversation, 'createFromReq')
    .returns(conversationCreateStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
  helpers.request.setConversation.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createConversation should inject a conversation into the req object when successfully creating a new conversation', async (t) => {
  const next = sinon.stub();
  sandbox.stub(Conversation, 'createFromReq')
    .returns(conversationCreateStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.setConversation.should.have.been.calledWith(t.context.req, mockConversation);
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('createConversation sends sendErrorResponse on create Conversation error', async (t) => {
  const next = sinon.stub();
  sandbox.stub(Conversation, 'createFromReq')
    .returns(conversationCreateFailStub);
  const middleware = createConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  helpers.request.setConversation.should.not.have.been.called;
  next.should.not.have.been.called;
});
