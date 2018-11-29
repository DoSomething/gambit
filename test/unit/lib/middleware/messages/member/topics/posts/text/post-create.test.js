'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../../../lib/helpers');
const stubs = require('../../../../../../../../helpers/stubs');
const topicFactory = require('../../../../../../../../helpers/factories/topic');
const userFactory = require('../../../../../../../../helpers/factories/user');

const mockInboundMessageText = stubs.getRandomMessageText;
const mockPlatform = stubs.getPlatform();
const mockPost = { id: 23121 };
const mockTopic = topicFactory.getValidTextPostConfig();
const mockUser = userFactory.getValidUser();

chai.should();
chai.use(sinonChai);

// module to be tested
const textPostCatchAll = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/text/post-create');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.inboundMessageText = mockInboundMessageText;
  t.context.req.platform = mockPlatform;
  t.context.req.topic = mockTopic;
  t.context.req.user = mockUser;
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
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
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

test('textPostCatchAll should call createTextPost and send completedTextPost if inboundMessageText is valid text post', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  const mockCampaign = mockTopic.campaign;
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(true);
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
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
  helpers.user.createTextPost
    .should.have.been.calledWith(mockUser, mockCampaign, mockPlatform, mockInboundMessageText);
  helpers.replies.invalidText.should.not.have.been.called;
  helpers.replies.completedTextPost.should.have.been.calledWith(t.context.req, t.context.res);
});

test('textPostCatchAll should send error response post if completedTextPost reply fails', async (t) => {
  const next = sinon.stub();
  const middleware = textPostCatchAll();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isTextPostConfig')
    .returns(true);
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
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
