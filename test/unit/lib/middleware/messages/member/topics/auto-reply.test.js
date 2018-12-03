'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../lib/helpers');
const stubs = require('../../../../../../helpers/stubs');
const topicFactory = require('../../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const autoReplyCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/auto-reply');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('autoReplyCatchAll should call next if not topic.isAutoReply', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTextPostConfig();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(false);
  sandbox.stub(helpers.replies, 'autoReply')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isAutoReply.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.autoReply.should.not.have.been.called;
});


test('autoReplyCatchAll should send autoReply if topic.isAutoReply', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTopicWithoutCampaign();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(true);
  sandbox.stub(helpers.replies, 'autoReply')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.not.have.been.called;
  helpers.replies.autoReply.should.have.been.calledWith(t.context.req, t.context.res);
});

test('autoReplyCatchAll calls sendErrorResponse if isAutoReply throws', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  const error = stubs.getError();
  t.context.req.topic = topicFactory.getValidTextPostConfig();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .throws(error);
  sandbox.stub(helpers.replies, 'autoReply')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.replies.autoReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
