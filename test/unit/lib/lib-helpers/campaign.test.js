'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const campaignFactory = require('../../../helpers/factories/campaign');

chai.should();
chai.use(sinonChai);

// module to be tested
const campaignHelper = require('../../../../lib/helpers/campaign');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// isClosedCampaign
test('isClosedCampaign should return false when campaign.endDate undefined', (t) => {
  t.falsy(campaignHelper.isClosedCampaign(campaignFactory.getValidCampaign()));
});

test('isClosedCampaign should return true when campaign.endDate has past', (t) => {
  t.truthy(campaignHelper.isClosedCampaign(campaignFactory.getValidClosedCampaign()));
});

test('isClosedCampaign should return false when campaign.endDate is in the future', (t) => {
  const campaign = campaignFactory.getValidClosedCampaign();

  campaign.endDate = '2088-07-19T00:00:00Z';

  t.falsy(campaignHelper.isClosedCampaign(campaign));
});
