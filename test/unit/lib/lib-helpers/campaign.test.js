'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const graphql = require('../../../../lib/graphql');

const campaignFactory = require('../../../helpers/factories/campaign');
const webSignupConfirmationFactory = require('../../../helpers/factories/webSignupConfirmation');

chai.should();
chai.use(sinonChai);

// module to be tested
const campaignHelper = require('../../../../lib/helpers/campaign');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchWebSignupConfirmationByCampaignId
test('fetchWebSignupConfirmationByCampaignId returns webSignupConfirmation if fetchWebSignupConfirmations has a webSignupConfirmation with given campaign id', async () => {
  const campaign = campaignFactory.getValidCampaign();
  const firstStub = webSignupConfirmationFactory.getValidWebSignupConfirmation(campaign);
  const secondStub = webSignupConfirmationFactory
    .getValidWebSignupConfirmation(campaignFactory.getValidCampaign());
  sandbox.stub(graphql, 'fetchWebSignupConfirmations').returns([firstStub, secondStub]);

  const result = await campaignHelper.fetchWebSignupConfirmationByCampaignId(campaign.id);
  result.should.deep.equal(firstStub);
});

test('fetchWebSignupConfirmationByCampaignId returns null if fetchWebSignupConfirmations does not have a webSignupConfirmation with given campaign id', async (t) => {
  const firstStub = webSignupConfirmationFactory
    .getValidWebSignupConfirmation(campaignFactory.getValidCampaign());
  const secondStub = webSignupConfirmationFactory
    .getValidWebSignupConfirmation(campaignFactory.getValidCampaign());
  sandbox.stub(graphql, 'fetchWebSignupConfirmations').returns([firstStub, secondStub]);
  const campaign = campaignFactory.getValidCampaign();

  const result = await campaignHelper.fetchWebSignupConfirmationByCampaignId(campaign.id);
  t.falsy(result);
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
