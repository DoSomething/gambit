'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');

chai.should();
chai.use(sinonChai);

// module to be tested
const catchAllMacro = require('../../../../../../lib/middleware/messages/member/macro-catch-all');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('catchAllMacro should call replies.noCampaign if not request.hasCampaign', async (t) => {
  const next = sinon.stub();
  const middleware = catchAllMacro();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(false);
  sandbox.stub(helpers.replies, 'noCampaign')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.noCampaign.should.have.been.calledWith(t.context.req, t.context.res);
});

test('catchAllMacro should call replies.campaignClosed if request.isClosedCampaign', async (t) => {
  const next = sinon.stub();
  const middleware = catchAllMacro();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.request, 'isClosedCampaign')
    .returns(true);
  sandbox.stub(helpers.replies, 'campaignClosed')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  helpers.request.isClosedCampaign.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.campaignClosed.should.have.been.calledWith(t.context.req, t.context.res);
});

test('catchAllMacro should call replies.continueTopic if request has active campaign, is not an ask template, and last outbound template is not a topic template', async (t) => {
  const next = sinon.stub();
  const middleware = catchAllMacro();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.request, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(helpers.request, 'isLastOutboundAskContinue')
    .returns(false);
  sandbox.stub(helpers.request, 'isLastOutboundAskSignup')
    .returns(false);
  sandbox.stub(helpers.request, 'isLastOutboundTopicTemplate')
    .returns(true);
  sandbox.stub(helpers.replies, 'continueTopic')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  helpers.request.isClosedCampaign.should.have.been.calledWith(t.context.req);
  helpers.request.isLastOutboundAskContinue.should.have.been.calledWith(t.context.req);
  helpers.request.isLastOutboundAskSignup.should.have.been.calledWith(t.context.req);
  helpers.request.isLastOutboundTopicTemplate.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.continueTopic.should.have.been.calledWith(t.context.req, t.context.res);
});
