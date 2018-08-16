'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const topicFactory = require('../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const autoReplyCatchAll = require('../../../../../../lib/middleware/messages/member/catchAll-autoReply');

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

test('autoReplyCatchAll should call replies.autoReply if topic.isAutoReply is false', async (t) => {
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

test('autoReplyCatchAll should call postCampaignActivityFromReq if shouldSendAutoReply and hasCampaign', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTextPostConfig();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(true);
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.request, 'postCampaignActivityFromReq')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.postCampaignActivityFromReq.should.have.been.called;
  helpers.replies.sendReplyWithTopicTemplate.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('autoReplyCatchAll does not call postCampaignActivityFromReq if shouldSendAutoReply and topic does not have campaign', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTopicWithoutCampaign();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(true);
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(false);
  sandbox.stub(helpers.request, 'postCampaignActivityFromReq')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.postCampaignActivityFromReq.should.not.have.been.called;
  helpers.replies.sendReplyWithTopicTemplate.should.have.been.called;
});

test('autoReplyCatchAll calls sendErrorResponse if postCampaignActivityFromReq fails', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTextPostConfig();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(true);
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  const mockError = { message: 'oh no' };
  sandbox.stub(helpers.request, 'postCampaignActivityFromReq')
    .returns(Promise.reject(mockError));
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.replies.sendReplyWithTopicTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
});

test('autoReplyCatchAll calls sendErrorResponse if sendReplyWithTopicTemplate fails', async (t) => {
  const next = sinon.stub();
  const middleware = autoReplyCatchAll();
  t.context.req.topic = topicFactory.getValidTopicWithoutCampaign();
  sandbox.stub(helpers.topic, 'isAutoReply')
    .returns(true);
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  const mockError = { message: 'oh no' };
  sandbox.stub(helpers.request, 'postCampaignActivityFromReq')
    .returns(Promise.resolve());
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .throws(mockError);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
});
