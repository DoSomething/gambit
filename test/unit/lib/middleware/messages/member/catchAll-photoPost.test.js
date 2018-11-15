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
const topicFactory = require('../../../../../helpers/factories/topic');
const userFactory = require('../../../../../helpers/factories/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const photoPostCatchAll = require('../../../../../../lib/middleware/messages/member/catchAll-photoPost');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.topic = topicFactory.getValidPhotoPostConfig();
  t.context.req.user = userFactory.getValidUser();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  t.context.req.platform = stubs.getPlatform();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('photoPostCatchAll should call next if topic is not a photoPostConfig', async (t) => {
  const next = sinon.stub();
  const middleware = photoPostCatchAll();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.sendReplyWithTopicTemplate.should.not.have.been.called;
});

test('photoPostCatchAll should call postCampaignActivity and return result replyTemplate if topic is a photoPostConfig', async (t) => {
  const next = sinon.stub();
  const middleware = photoPostCatchAll();
  const mockResponse = stubs.gambitCampaigns.getReceiveMessageResponse();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'postCampaignActivity')
    .returns(Promise.resolve(mockResponse));
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.request.postCampaignActivity.should.have.been.calledWith(t.context.req);
  helpers.replies.sendReplyWithTopicTemplate
    .should.have.been.calledWith(t.context.req, t.context.res, mockResponse.replyTemplate);
});

test('photoPostCatchAll should call sendErrorResponse if postCampaignActivity fails', async (t) => {
  const next = sinon.stub();
  const middleware = photoPostCatchAll();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'postCampaignActivity')
    .returns(Promise.reject(error));
  sandbox.stub(helpers.replies, 'sendReplyWithTopicTemplate')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.request.postCampaignActivity.should.have.been.calledWith(t.context.req);
  helpers.replies.sendReplyWithTopicTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
