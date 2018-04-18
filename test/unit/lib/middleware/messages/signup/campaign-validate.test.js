'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const gambitCampaigns = require('../../../../../../lib/gambit-campaigns');
const helpers = require('../../../../../../lib/helpers');
const campaignFactory = require('../../../../../helpers/factories/campaign');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const validateCampaign = require('../../../../../../lib/middleware/messages/signup/campaign-validate');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'addBlinkSuppressHeaders')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithStatusCode')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('validateCampaign should call sendErrorResponse if campaign is closed', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateCampaign should send 204 if campaign does not have keywords', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(gambitCampaigns, 'hasKeywords')
    .returns(false);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode.should.have.been.called;
  helpers.addBlinkSuppressHeaders.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('validateCampaign should next if campaign is not closed and has keywords', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(gambitCampaigns, 'hasKeywords')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});
