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

// stubs
const campaign = campaignFactory.getValidCampaign();
const webSignup = campaign.config.templates.webSignup;
const campaignId = campaign.id;

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getCampaign = require('../../../../../../lib/middleware/messages/signup/campaign-get');

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
test('getCampaign should call campaign.fetchById and setTopic if campaign is not closed and has webSignup', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.resolve(campaign));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.campaign.fetchById.should.have.been.calledWith(campaignId);
  helpers.request.setOutboundMessageText
    .should.have.been.calledWith(t.context.req, webSignup.text);
  helpers.request.setOutboundMessageTemplate
    .should.have.been.calledWith(t.context.req, webSignup.template);
  helpers.request.setTopic.should.have.been.calledWith(t.context.req, webSignup.topic);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});

test('getCampaign should call sendErroResponse if campaign is closed', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'isClosedCampaign')
    .returns(true);
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.resolve(campaign));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.campaign.fetchById.should.have.been.calledWith(campaignId);
  helpers.request.setOutboundMessageText.should.not.have.been.called;
  helpers.request.setOutboundMessageTemplate.should.not.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('getCampaign should send 204 status if campaign config does not exist', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  const configlessCampaign = campaignFactory.getValidCampaign();
  configlessCampaign.config = {};
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.resolve(configlessCampaign));
  // TODO: Move this hardcoded message into config to DRY.
  const apiResponseMessage = 'Campaign does not have a config.';

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode
    .should.have.been.calledWith(t.context.res, 204, apiResponseMessage);
  helpers.addBlinkSuppressHeaders.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('getCampaign should send 204 status if campaign config does not have webSignup template', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.resolve(campaignFactory.getValidCampaignWithoutWebSignup()));
  // TODO: Move this hardcoded message into config to DRY.
  const apiResponseMessage = 'Campaign does not have a webSignup.';

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode
    .should.have.been.calledWith(t.context.res, 204, apiResponseMessage);
  helpers.addBlinkSuppressHeaders.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('getCampaign should call sendErrorResponse if fetchById fails', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.campaign, 'fetchById')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
  next.should.not.have.been.called;
});
