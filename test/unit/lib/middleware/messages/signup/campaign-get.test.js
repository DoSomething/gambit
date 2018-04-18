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
const sendErrorResponseStub = underscore.noop;
const campaignStub = campaignFactory.getValidCampaign();
const campaignIdStub = campaignStub.id;
const campaignLookupStub = () => Promise.resolve(campaignStub);
const campaignLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const campaignLookupNotFoundStub = () => Promise.resolve(null);

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getCampaign = require('../../../../../../lib/middleware/messages/signup/campaign-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);
  t.context.req = httpMocks.createRequest();
  t.context.req.campaignId = campaignIdStub;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('getCampaign should call fetchById and inject campaign property to req', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'fetchById')
    .callsFake(campaignLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.campaign.should.deep.equal(campaignStub);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});


test('getCampaign should call sendErrorResponse if campaign not found', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'fetchById')
    .callsFake(campaignLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('campaign');
  next.should.not.have.been.called;
});

test('getCampaign should call sendErrorResponse if fetchById fails', async (t) => {
  const next = sinon.stub();
  const middleware = getCampaign();
  sandbox.stub(helpers.campaign, 'fetchById')
    .callsFake(campaignLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('campaign');
  next.should.not.have.been.called;
});
