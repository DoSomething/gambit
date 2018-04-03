'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const config = require('../../../config/lib/gambit-campaigns');


chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const gambitCampaigns = require('../../../lib/gambit-campaigns');

// stubs
const campaignFactory = require('../../helpers/factories/campaign');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// isClosedCampaign
test('isClosedCampaign should return true when campaign is active', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  const result = gambitCampaigns.isClosedCampaign(campaign);
  t.falsy(result);
});

test('isClosedCampaign should return false when campaign is closed', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  campaign.status = config.closedStatusValue;
  const result = gambitCampaigns.isClosedCampaign(campaign);
  t.truthy(result);
});

test('hasKeywords should return true when campaign has keywords', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  const result = gambitCampaigns.hasKeywords(campaign);
  t.truthy(result);
});

test('hasKeywords should return false when campaign does not have keywords', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  campaign.keywords = [];
  const result = gambitCampaigns.hasKeywords(campaign);
  t.falsy(result);
});