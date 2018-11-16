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
const userFactory = require('../../../../../../helpers/factories/user');

const mockPost = { id: 23121 };

chai.should();
chai.use(sinonChai);

// module to be tested
const textPostCatchAll = require('../../../../../../../lib/middleware/messages/member/topics/textPost');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.topic = topicFactory.getValidTextPostConfig();
  t.context.req.user = userFactory.getValidUser();
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  t.context.req.platform = stubs.getPlatform();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('textPostCatchAll should call next if topic.isTextPostConfig is false', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(false);
  sandbox.stub(helpers.replies, 'invalidText')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'completedTextPost')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isTextPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.invalidText.should.not.have.been.called;
  helpers.replies.completedTextPost.should.not.have.been.called;
});

test('textPostCatchAll should send invalidText reply if inboundMessageText is not valid text post', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(true);
  sandbox.stub(helpers.util, 'isValidTextPost')
    .returns(false);
  sandbox.stub(helpers.replies, 'invalidText')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'completedTextPost')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isTextPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.replies.invalidText.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.replies.completedTextPost.should.not.have.been.called;
});

test('textPostCatchAll should send create text post and completedTextPost reply if inboundMessageText is valid text post', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(true);
  sandbox.stub(helpers.util, 'isValidTextPost')
    .returns(true);
  sandbox.stub(helpers.replies, 'invalidText')
    .returns(underscore.noop);
  sandbox.stub(helpers.user, 'createTextPost')
    .returns(Promise.resolve({ data: mockPost }));
  sandbox.stub(helpers.replies, 'completedTextPost')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isTextPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.user.createTextPost.should.have.been.calledWith(t.context.req.user, {
    campaignId: t.context.req.topic.campaign.id,
    campaignRunId: t.context.req.topic.campaign.currentCampaignRun.id,
    source: t.context.req.platform,
    text: t.context.req.inboundMessageText,
  });
  helpers.replies.invalidText.should.not.have.been.called;
  helpers.replies.completedTextPost.should.have.been.calledWith(t.context.req, t.context.res);
});

test('textPostCatchAll should send error response post if completedTextPost reply fails', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(true);
  sandbox.stub(helpers.util, 'isValidTextPost')
    .returns(true);
  sandbox.stub(helpers.replies, 'invalidText')
    .returns(underscore.noop);
  sandbox.stub(helpers.user, 'createTextPost')
    .returns(Promise.resolve({ data: mockPost }));
  sandbox.stub(helpers.replies, 'completedTextPost')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
