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

chai.should();
chai.use(sinonChai);

const newDraft = draftSubmissionFactory.getValidNewDraftSubmission();

// module to be tested
const createDraft = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/photo/draft-create');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'startPhotoPostAutoReply')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'askQuantity')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setDraftSubmission')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('createDraft should call next if topic is not photo post', async (t) => {
  const next = sinon.stub();
  const middleware = createDraft();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.startPhotoPostAutoReply.should.not.have.been.called;
  helpers.replies.askQuantity.should.not.have.been.called;
});

test('createDraft should call next if request hasDraftSubmission', async (t) => {
  const next = sinon.stub();
  const middleware = createDraft();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'getDraftSubmission')
    .returns(Promise.resolve(newDraft));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.getDraftSubmission.should.have.been.calledWith(t.context.req);
  helpers.request.setDraftSubmission.should.have.been.calledWith(t.context.req, newDraft);
  next.should.have.been.called;
  helpers.replies.startPhotoPostAutoReply.should.not.have.been.called;
  helpers.replies.askQuantity.should.not.have.been.called;
});

test('createDraft should call createDraftSubmission and askQuantity if request does not have draft and is start command', async (t) => {
  const next = sinon.stub();
  const middleware = createDraft();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'getDraftSubmission')
    .returns(Promise.resolve(null));
  sandbox.stub(helpers.request, 'isStartCommand')
    .returns(true);
  sandbox.stub(helpers.request, 'createDraftSubmission')
    .returns(Promise.resolve(newDraft));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.getDraftSubmission.should.have.been.calledWith(t.context.req);
  helpers.request.setDraftSubmission.should.not.have.been.called;
  helpers.request.createDraftSubmission.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.startPhotoPostAutoReply.should.not.have.been.called;
  helpers.replies.askQuantity.should.have.been.calledWith(t.context.req, t.context.res);
});

test('createDraft should call startPhotoPostAutoReply if request does not have draft and is not start command', async (t) => {
  const next = sinon.stub();
  const middleware = createDraft();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'getDraftSubmission')
    .returns(Promise.resolve(null));
  sandbox.stub(helpers.request, 'isStartCommand')
    .returns(false);
  sandbox.stub(helpers.request, 'createDraftSubmission')
    .returns(Promise.resolve(newDraft));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.getDraftSubmission.should.have.been.calledWith(t.context.req);
  helpers.request.setDraftSubmission.should.not.have.been.called;
  helpers.request.createDraftSubmission.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.startPhotoPostAutoReply.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.replies.askQuantity.should.not.have.been.called;
});

test('createDraft should call sendErrorResponse if error is caught', async (t) => {
  const next = sinon.stub();
  const middleware = createDraft();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
