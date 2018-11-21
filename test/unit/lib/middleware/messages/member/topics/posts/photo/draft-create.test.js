'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../../../../lib/helpers');
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
  next.should.have.been.called;
  helpers.replies.startPhotoPostAutoReply.should.not.have.been.called;
  helpers.replies.askQuantity.should.not.have.been.called;
});

