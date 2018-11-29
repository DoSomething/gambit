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

const captionKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().caption;
const mockInboundMessageText = stubs.getRandomMessageText();

chai.should();
chai.use(sinonChai);

// module to be tested
const draftCaption = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/photo/draft-caption');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'askWhyParticipated')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'invalidCaption')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.inboundMessageText = mockInboundMessageText;
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('draftCaption should call next if topic is not photo post', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidCaption.should.not.have.been.called;
});

test('draftCaption should call next if request hasDraftSubmissionValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidCaption.should.not.have.been.called;
});

test('draftCaption should call save draft value if request does not have draft value and has valid text field value, and call next if hasSignupWithWhyParticipated', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(mockInboundMessageText);
  helpers.request.saveDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey, mockInboundMessageText);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidCaption.should.not.have.been.called;
});

test('draftCaption should call save draft value if request does not have draft value and has valid text field value, and send askWhyParticipated if not hasSignupWithWhyParticipated', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
    .returns(true);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(false));
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(mockInboundMessageText);
  helpers.request.saveDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey, mockInboundMessageText);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.askWhyParticipated.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.replies.invalidCaption.should.not.have.been.called;
});

test('draftCaption should not call save draft value if request does not have draft value and does not valid text field value, and send invalidCaption', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.util, 'isValidTextFieldValue')
    .returns(false);
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, captionKey);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(mockInboundMessageText);
  helpers.request.saveDraftSubmissionValue.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidCaption.should.have.been.calledWith(t.context.req, t.context.res);
});

test('draftCaption should call sendErrorResponse if error is caught', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
