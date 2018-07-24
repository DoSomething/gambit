'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const campaignHelperConfig = require('../../../../config/lib/helpers/campaign');

const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');

const campaignStub = campaignFactory.getValidCampaign();
const postTypeStub = stubs.getPostType();
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

// fetchAllActive
test('fetchAllActive calls gambitCampaigns.fetchCampaigns and filters by isClosedCampaign', async () => {
  const campaigns = [campaignFactory.getValidCampaign(), campaignFactory.getValidCampaign()];
  sandbox.stub(gambitCampaigns, 'fetchCampaigns')
    .returns(Promise.resolve({ data: campaigns }));
  sandbox.stub(campaignHelper, 'isClosedCampaign')
    .returns(false);

  const result = await campaignHelper.fetchAllActive();
  gambitCampaigns.fetchCampaigns.should.have.been.called;
  campaigns.forEach((campaign) => {
    campaignHelper.isClosedCampaign.should.have.been.calledWith(campaign);
  });
  result.should.deep.equal(campaigns);
});

// fetchById
test('fetchById calls gambitCampaigns.fetchCampaignById', async () => {
  sandbox.stub(gambitCampaigns, 'fetchCampaignById')
    .returns(campaignLookupStub);
  const campaignId = campaignStub.id;

  const result = await campaignHelper.fetchById(campaignId);
  gambitCampaigns.fetchCampaignById.should.have.been.calledWith(campaignId);
  result.should.deep.equal(campaignLookupStub);
});

// getPostTypeFromCampaign
test('getPostTypeFromCampaign should return a string if campaign has topics', () => {
  const result = campaignHelper.getPostTypeFromCampaign(campaignStub);
  result.should.equal(postTypeStub);
});

test('getPostTypeFromCampaign should return null if campaign does not have any topics', (t) => {
  const campaign = campaignFactory.getValidCampaign();
  campaign.topics = [];
  t.is(campaignHelper.getPostTypeFromCampaign(campaign), null);
});

// getWebSignupMessageTemplateNameFromCampaign
test('getWebSignupMessageTemplateNameFromCampaign returns string from config.signupMessageTemplateNamesByPostType', () => {
  const result = campaignHelper.getWebSignupMessageTemplateNameFromCampaign(campaignStub);
  const templateName = campaignHelperConfig.signupMessageTemplateNamesByPostType[postTypeStub];
  result.should.equal(templateName);
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
