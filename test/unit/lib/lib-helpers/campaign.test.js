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

// fetchById
test('fetchById calls gambitCampaigns.getCampaignById', async () => {
  sandbox.stub(gambitCampaigns, 'getCampaignById')
    .returns(campaignLookupStub);
  const campaignId = campaignStub.id;

  const result = await campaignHelper.fetchById(campaignId);
  gambitCampaigns.getCampaignById.should.have.been.calledWith(campaignId);
  result.should.deep.equal(campaignLookupStub);
});

// getWebSignupMessageTemplateNameFromCampaign
test('getWebSignupMessageTemplateNameFromCampaign returns string from config.signupMessageTemplateNamesByPostType', () => {
  const result = campaignHelper.getWebSignupMessageTemplateNameFromCampaign(campaignStub);
  const templateName = campaignHelperConfig.signupMessageTemplateNamesByPostType[postTypeStub];
  result.should.equal(templateName);
});

// isClosedCampaign
test('isClosedCampaign calls gambitCampaigns.isClosedCampaign', (t) => {
  sandbox.stub(gambitCampaigns, 'isClosedCampaign')
    .returns(true);
  const result = campaignHelper.isClosedCampaign(campaignStub);
  t.truthy(result);
  gambitCampaigns.isClosedCampaign.should.have.been.calledWith(campaignStub);
});
