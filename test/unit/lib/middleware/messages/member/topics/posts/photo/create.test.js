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
const draftSubmissionFactory = require('../../../../../../../../helpers/factories/draftSubmission');
const topicFactory = require('../../../../../../../../helpers/factories/topic');
const userFactory = require('../../../../../../../../helpers/factories/user');

chai.should();
chai.use(sinonChai);

const completeDraft = draftSubmissionFactory.getValidCompletePhotoPostDraftSubmission();
const mockPost = { id: stubs.getPostId() };

// module to be tested
const createPhotoPost = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/photo/create');

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

test('createPhotoPost should call next if topic is not a photoPostConfig', async (t) => {
  const next = sinon.stub();
  const middleware = createPhotoPost();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);
  sandbox.stub(helpers.replies, 'completedPhotoPost')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.completedPhotoPost.should.not.have.been.called;
});

test('createPhotoPost should call sendErrorResponse if req.draftSubmission is undefined', async (t) => {
  const next = sinon.stub();
  const middleware = createPhotoPost();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.user, 'createPhotoPost')
    .returns(Promise.resolve(mockPost));
  sandbox.stub(helpers.replies, 'completedPhotoPost')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.user.createPhotoPost.should.not.have.been.called;
  helpers.replies.completedPhotoPost.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('createPhotoPost should call sendErrorResponse if createPhotoPost fails', async (t) => {
  const next = sinon.stub();
  const middleware = createPhotoPost();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.user, 'createPhotoPost')
    .returns(Promise.reject(error));
  sandbox.stub(helpers.replies, 'completedPhotoPost')
    .returns(underscore.noop);
  t.context.req.draftSubmission = completeDraft;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.not.have.been.called;
  helpers.user.createPhotoPost.should.have.been.called;
  helpers.replies.completedPhotoPost.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
