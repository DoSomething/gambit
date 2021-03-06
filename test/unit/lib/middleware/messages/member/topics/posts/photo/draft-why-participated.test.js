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

const whyParticipatedKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().whyParticipated;
const mockInboundMessageText = stubs.getRandomMessageText();

chai.should();
chai.use(sinonChai);

// module to be tested
const draftWhyParticipated = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/photo/draft-why-participated');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'invalidWhyParticipated')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.inboundMessageText = mockInboundMessageText;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('draftWhyParticipated should call next if topic is not photo post', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
});

test('draftWhyParticipated should call next if request hasSignupWithWhyParticipated', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
});

test('draftWhyParticipated should call next if request not hasSignupWithWhyParticipated and request hasDraftSubmissionValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(false));
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  helpers.request.hasDraftSubmissionValue.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
});

test('draftWhyParticipated calls saveDraftSubmissionValue and next if request not hasSignupWithWhyParticipated, does not have draft value, and isValidTextFieldValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(false));
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve());
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  helpers.request.hasDraftSubmissionValue.should.have.been.calledWith(t.context.req);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(t.context.req.inboundMessageText);
  helpers.request.saveDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, whyParticipatedKey, mockInboundMessageText);
  next.should.have.been.called;
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
});

test('draftWhyParticipated sends invalidWhyParticipated if request not hasSignupWithWhyParticipated, does not have draft value, and not isValidTextFieldValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(false));
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve());
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  helpers.request.hasDraftSubmissionValue.should.have.been.calledWith(t.context.req);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(t.context.req.inboundMessageText);
  helpers.request.saveDraftSubmissionValue.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.invalidWhyParticipated.should.have.been.calledWith(t.context.req, t.context.res);
});

test('draftWhyParticipated should call sendErrorResponse if error is caught', async (t) => {
  const next = sinon.stub();
  const middleware = draftWhyParticipated();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
