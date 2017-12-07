'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const helpers = require('../../../../lib/helpers');
const gambitCampaigns = require('../../../../lib/gambit-campaigns');

const requestHelper = helpers.request;

chai.should();
chai.use(sinonChai);

// module to be tested
const getCampaignByKeyword = require('../../../../lib/middleware/receive-message/campaign-keyword');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.inboundMessageText = 'winter';
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getCampaignByKeyword should not call gambitCampaigns.getCampaignByKeyword if requestHelper.parseCampaignKeyword is null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns(null);
  sandbox.spy(gambitCampaigns, 'getCampaignByKeyword');

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.have.been.called;
  gambitCampaigns.getCampaignByKeyword.should.not.have.been.called;
});

test('getCampaignByKeyword should call gambitCampaigns.getCampaignByKeyword if requestHelper.parseCampaignKeyword', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getCampaignByKeyword();
  sandbox.stub(requestHelper, 'parseCampaignKeyword')
    .returns('winter');
  sandbox.stub(gambitCampaigns, 'getCampaignByKeyword').returns(Promise.resolve(true));

  // test
  await middleware(t.context.req, t.context.res, next);
  gambitCampaigns.getCampaignByKeyword.should.have.been.called;
});
