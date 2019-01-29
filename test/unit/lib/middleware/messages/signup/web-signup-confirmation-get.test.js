'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../../lib/helpers');
const campaignFactory = require('../../../../../helpers/factories/campaign');
const webSignupConfirmationFactory = require('../../../../../helpers/factories/webSignupConfirmation');
const stubs = require('../../../../../helpers/stubs');

// stubs
const campaignId = stubs.getCampaignId();
const webSignupConfirmation = webSignupConfirmationFactory
  .getValidWebSignupConfirmation(campaignFactory.getValidCampaign());

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getWebSignupConfirmation = require('../../../../../../lib/middleware/messages/signup/web-signup-confirmation-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'addBlinkSuppressHeaders')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithStatusCode')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageTemplate')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageText')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.response, 'sendNoContent')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.campaignId = campaignId;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('getWebSignupConfirmation should set outbound message vars if campaign has a webSignupConfirmation', async (t) => {
  const next = sinon.stub();
  const middleware = getWebSignupConfirmation();
  sandbox.stub(helpers.campaign, 'getWebSignupConfirmationByCampaignId')
    .returns(Promise.resolve(webSignupConfirmation));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.campaign.getWebSignupConfirmationByCampaignId.should.have.been.calledWith(campaignId);
  helpers.request.setOutboundMessageText
    .should.have.been.calledWith(t.context.req, webSignupConfirmation.text);
  helpers.request.setTopic.should.have.been.calledWith(t.context.req, webSignupConfirmation.topic);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});

test('getWebSignupConfirmation should call sendNoContent if webSignupConfirmation not found', async (t) => {
  const next = sinon.stub();
  const middleware = getWebSignupConfirmation();
  sandbox.stub(helpers.campaign, 'getWebSignupConfirmationByCampaignId')
    .returns(Promise.resolve(null));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.response.sendNoContent.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('getWebSignupConfirmation should call sendErrorResponse if campaign has ended', async (t) => {
  const next = sinon.stub();
  const middleware = getWebSignupConfirmation();
  const stubConfirmation = webSignupConfirmationFactory
    .getValidWebSignupConfirmation(campaignFactory.getValidClosedCampaign());
  sandbox.stub(helpers.campaign, 'getWebSignupConfirmationByCampaignId')
    .returns(Promise.resolve(stubConfirmation));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('getWebSignupConfirmation should call sendErrorResponse if webSignupConfirmation fails', async (t) => {
  const next = sinon.stub();
  const middleware = getWebSignupConfirmation();
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.campaign, 'getWebSignupConfirmationByCampaignId')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
  next.should.not.have.been.called;
});
