'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const Promise = require('bluebird');

const stubs = require('../../helpers/stubs');
const logger = require('../../../lib/logger');
const gambitCampaigns = require('../../../lib/gambit-campaigns');
const helpers = require('../../../lib/helpers');
const templatesConfig = require('../../../config/lib/helpers/template');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const repliesHelper = require('../../../lib/helpers/replies');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// misc helper vars
const gCampResponse = stubs.gambitCampaigns.getReceiveMessageResponse();
const templates = templatesConfig.templatesMap;

// Setup
test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(() => {});

  // add a campaign object
  t.context.req.campaign = { id: stubs.getCampaignId() };
});

// Cleanup
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('continueCampaign(): sendReplyWithCampaignTemplate should be called', async (t) => {
  // Setup
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(() => {});
  sandbox.stub(gambitCampaigns, 'postReceiveMessage')
    .returns(Promise.resolve(gCampResponse.data));

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.have.been.called;
});

test('continueCampaign(): helpers.sendErrorResponse should be called if no campaign exists', async (t) => {
  // Setup
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(() => {});
  sandbox.stub(gambitCampaigns, 'postReceiveMessage')
    .returns(Promise.reject(gCampResponse.data));

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('continueCampaign(): helpers.sendErrorResponse should be called on Gambit Campaign error', async (t) => {
  // Setup
  t.context.req.campaign = {};
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(() => {});

  await repliesHelper.continueCampaign(t.context.req, t.context.res);
  repliesHelper.sendReplyWithCampaignTemplate.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('askContinue(): sendReplyWithCampaignTemplate should be called', async (t) => {
  // Setup
  const replies = [
    templates.askContinueTemplates.askContinue,
    templates.askSignupTemplates.askSignup,
    templates.campaignClosed,
    templates.declinedContinue,
    templates.declinedSignup,
    templates.askContinueTemplates.invalidAskContinueResponse,
    templates.askSignupTemplates.invalidAskSignupResponse,
  ];
  sandbox.stub(repliesHelper, 'sendReplyWithCampaignTemplate')
    .returns(() => {});

  replies.forEach((template) => {
    sandbox.spy(repliesHelper, template);
    // async IIFE Needed to avoid using promises
    (async () => {
      await repliesHelper[template](t.context.req, t.context.res);
    })();
    repliesHelper.sendReplyWithCampaignTemplate
      .should.have.been.calledWith(t.context.req, t.context.res, template);
  });
});
