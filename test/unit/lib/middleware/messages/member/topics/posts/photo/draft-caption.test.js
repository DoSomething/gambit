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
  sandbox.stub(helpers.replies, 'invalidWhyParticipated')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
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
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
});

test('draftCaption should call next if request hasDraftSubmissionValue', async (t) => {
  const next = sinon.stub();
  const middleware = draftCaption();
  sandbox.stub(helpers.topic, 'isPhotoPostConfig')
    .returns(true);
  sandbox.stub(helpers.request, 'hasDraftSubmissionValue')
    .returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isPhotoPostConfig.should.have.been.calledWith(t.context.req.topic);
  helpers.request.hasDraftSubmissionValue.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.askWhyParticipated.should.not.have.been.called;
  helpers.replies.invalidWhyParticipated.should.not.have.been.called;
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
