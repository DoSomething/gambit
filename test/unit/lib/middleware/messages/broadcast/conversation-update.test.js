'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const conversationFactory = require('../../../../../helpers/factories/conversation');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const updateConversation = require('../../../../../../lib/middleware/messages/broadcast/conversation-update');

const conversation = conversationFactory.getValidConversation();

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = conversation;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('updateConversation should call sendErrorResponse if req.topic undefined', async (t) => {
  const next = sinon.stub();
  const middleware = updateConversation();
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.updateTopicIfChanged.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('updateConversation should call conversation.setTopic if req.topic is set', async (t) => {
  const next = sinon.stub();
  const middleware = updateConversation();
  const topic = stubs.getTopic();
  t.context.req.topic = topic;
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.updateTopicIfChanged.should.have.been.calledWith(t.context.req, topic);
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('updateConversation should call sendErrorResponse if changeTopic throws', async (t) => {
  const next = sinon.stub();
  const middleware = updateConversation();
  const topic = stubs.getTopic();
  t.context.req.topic = topic;
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.updateTopicIfChanged.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
  next.should.not.have.been.called;
});
