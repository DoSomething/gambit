'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');
const conversationFactory = require('../../../../helpers/factories/conversation');

const conversation = conversationFactory.getValidConversation();
const frontSuccessStub = Promise.resolve({ body: stubs.front.getConversationSuccessBody() });
const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);

// module to be tested
const updateConversation = require('../../../../../lib/middleware/messages/support/conversation-update');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = conversation;
  t.context.req.frontConversationUrl = stubs.front.getConversationUrl();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('updateConversation should call error if helpers.front.getConversationByUrl fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateConversation();
  sandbox.stub(helpers.front, 'getConversationByUrl')
    .returns(Promise.reject('epic fail'));
  sandbox.stub(helpers.front, 'isConversationArchived')
    .returns(true);
  sandbox.stub(conversation, 'setDefaultTopic')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.front.getConversationByUrl.should.have.been.called;
  helpers.front.isConversationArchived.should.not.have.been.called;
  conversation.setDefaultTopic.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('updateConversation should call setDefaultTopic if Front Conversation is archived', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = updateConversation();
  sandbox.stub(helpers.front, 'getConversationByUrl')
    .returns(frontSuccessStub);
  sandbox.stub(helpers.front, 'isConversationArchived')
    .returns(true);
  sandbox.stub(conversation, 'setDefaultTopic')
    .returns(resolvedPromise);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.front.getConversationByUrl.should.have.been.called;
  helpers.front.isConversationArchived.should.have.been.called;
  conversation.setDefaultTopic.should.have.been.called;
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

