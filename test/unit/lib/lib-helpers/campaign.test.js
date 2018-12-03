'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitContent = require('../../../../lib/gambit-content');
const campaignHelperConfig = require('../../../../config/lib/helpers/campaign');

const campaignFactory = require('../../../helpers/factories/campaign');

const campaignStub = campaignFactory.getValidCampaign();
const campaignLookupStub = () => Promise.resolve(campaignStub);

chai.should();
chai.use(sinonChai);

// module to be tested
const campaignHelper = require('../../../../lib/helpers/campaign');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchById
test('fetchById calls gambitContent.fetchCampaignById', async () => {
  sandbox.stub(gambitContent, 'fetchCampaignById')
    .returns(campaignLookupStub);
  const campaignId = campaignStub.id;

  const result = await campaignHelper.fetchById(campaignId);
  gambitContent.fetchCampaignById.should.have.been.calledWith(campaignId);
  result.should.deep.equal(campaignLookupStub);
});

// isClosedCampaign
test('isClosedCampaign should return true when campaign is active', (t) => {
  const result = campaignHelper.isClosedCampaign(campaignFactory.getValidCampaign());
  t.falsy(result);
});

test('isClosedCampaign should return false when campaign is closed', (t) => {
  const closedCampaign = campaignFactory.getValidCampaign();
  closedCampaign.status = campaignHelperConfig.statuses.closed;
  const result = campaignHelper.isClosedCampaign(closedCampaign);
  t.truthy(result);
});
