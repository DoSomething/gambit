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

const urlKey = helpers.topic.getPhotoPostDraftSubmissionValuesMap().url;
const mockInboundMessageText = stubs.getRandomMessageText();
// @TODO: Add this to stubs?
const mockInboundMediaUrl = 'http://someimageURL.jpg';

chai.should();
chai.use(sinonChai);

// module to be tested
const draftPhoto = require('../../../../../../../../../lib/middleware/messages/member/topics/posts/photo/draft-photo');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'invalidPhoto')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'askWhyParticipated')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  t.context.req.inboundMessageText = mockInboundMessageText;
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('draftPhoto should call next if topic is not photo post', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidPhoto.should.not.have.been.called;
});

test('draftPhoto should call next if request hasDraftSubmissionValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, urlKey);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidPhoto.should.not.have.been.called;
});

test('draftPhoto should call save draft value if request does not have draft value and the \'req\' has a mediaUrl value, and call next if hasSignupWithWhyParticipated', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(true));
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve(true));

  t.context.req.mediaUrl = mockInboundMediaUrl;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, urlKey);
  helpers.request.saveDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, urlKey, mockInboundMediaUrl);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidPhoto.should.not.have.been.called;
});

test.only('draftPhoto should call save draft value if request does not have draft value and the request has a mediaUrl value, and send askWhyParticipated if not hasSignupWithWhyParticipated', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(false);
  sandbox.stub(helpers.request, 'hasSignupWithWhyParticipated')
    .returns(Promise.resolve(false));
  sandbox.stub(helpers.request, 'saveDraftSubmissionValue')
    .returns(Promise.resolve(true));

  t.context.req.mediaUrl  = mockInboundMediaUrl;

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, urlKey);
  helpers.request.saveDraftSubmissionValue
    .should.have.been.calledWith(t.context.req, urlKey, mockInboundMediaUrl);
  helpers.request.hasSignupWithWhyParticipated.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.askWhyParticipated.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.replies.invalidPhoto.should.not.have.been.called;
});

test('draftPhoto should not call save draft value if request does not have draft value and does not valid text field value, and send invalidPhoto', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
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
    .should.have.been.calledWith(t.context.req, urlKey);
  helpers.util.isValidTextFieldValue.should.have.been.calledWith(mockInboundMessageText);
  helpers.request.saveDraftSubmissionValue.should.not.have.been.called;
  next.should.not.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidPhoto.should.have.been.calledWith(t.context.req, t.context.res);
});

test('draftPhoto should call sendErrorResponse if error is caught', async (t) => {
  const next = sinon.stub();
  const middleware = draftPhoto();
  const error = stubs.getError();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
