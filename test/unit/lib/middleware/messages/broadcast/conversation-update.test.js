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
const topicFactory = require('../../../../../helpers/factories/topic');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const updateConversation = require('../../../../../../lib/middleware/messages/broadcast/conversation-update');

const conversation = conversationFactory.getValidConversation();
const topic = topicFactory.getValidAutoReply();

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.errorNoticeable, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.broadcastId = stubs.getContentfulId();
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
  sandbox.stub(t.context.req.conversation, 'save')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.save.should.not.have.have.been.called;
  helpers.errorNoticeable.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('updateConversation should save lastBroadcastId and topic if req.topic is set', async (t) => {
  const next = sinon.stub();
  const middleware = updateConversation();
  t.context.req.topic = topic;
  sandbox.stub(t.context.req.conversation, 'save')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  t.context.req.conversation.save.should.have.have.been.called;
  t.context.req.conversation.topic.should.equal(topic.id);
  t.context.req.conversation.lastReceivedBroadcastId.should.equal(t.context.req.broadcastId);
  next.should.have.been.called;
  helpers.errorNoticeable.sendErrorResponse.should.not.have.been.called;
});

test('updateConversation should call sendErrorResponse if save throws', async (t) => {
  const next = sinon.stub();
  const middleware = updateConversation();
  t.context.req.topic = topic;
  const error = { message: 'Epic fail' };
  sandbox.stub(t.context.req.conversation, 'save')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.errorNoticeable.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
  next.should.not.have.been.called;
});
