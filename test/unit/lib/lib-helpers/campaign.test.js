'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const campaignHelperConfig = require('../../../../config/lib/helpers/campaign');

const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');

const campaignStub = campaignFactory.getValidCampaign();
const postTypeStub = stubs.getPostType();

chai.should();
chai.use(sinonChai);

// module to be tested
const campaignHelper = require('../../../../lib/helpers/campaign');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// getPostTypeFromCampaign
test('getPostTypeFromCampaign should return a string', () => {
  const result = campaignHelper.getPostTypeFromCampaign(campaignStub);
  result.should.equal(postTypeStub);
});

// getSignupMessageTemplateNameFromCampaign
test('getSignupMessageTemplateNameFromCampaign returns string from config.signupMessageTemplateNamesByPostType', () => {
  const result = campaignHelper.getSignupMessageTemplateNameFromCampaign(campaignStub);
  const templateName = campaignHelperConfig.signupMessageTemplateNamesByPostType[postTypeStub];
  result.should.equal(templateName);
});
