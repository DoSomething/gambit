'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const superagent = require('superagent');
const config = require('../../../config/lib/gambit-content');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const gambitContent = require('../../../lib/gambit-content');

// stubs
const campaignFactory = require('../../helpers/factories/campaign');

const campaign = campaignFactory.getValidCampaign();
const fetchSuccess = { data: ['abc', 'def'] };
const queryParams = { skip: 11 };

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// apiUrl
test('apiUrl return given endpoint param with prefixed with config.clientOptions.baseUri ', () => {
  const endpoint = 'dragons';
  const result = gambitContent.apiUrl(endpoint);
  result.should.equal(`${config.clientOptions.baseUri}/${endpoint}`);
});

// executeGet
test('executeGet should call superagent.get with apiUrl and parse body', async () => {
  const endpoint = 'dragons';
  const apiUrl = `${config.clientOptions.apiUrl}/${endpoint}`;
  sandbox.stub(gambitContent, 'apiUrl')
    .returns(apiUrl);
  sandbox.stub(superagent, 'get')
    .callsFake(() => ({
      // TODO: These nested functions should be stubbed to verify args passed.
      set: () => { // eslint-disable-line arrow-body-style
        return {
          query: () => Promise.resolve({ body: fetchSuccess }),
        };
      },
    }));

  const result = await gambitContent.executeGet(endpoint, queryParams);
  result.should.equal(fetchSuccess);
  gambitContent.apiUrl.should.have.been.calledWith(endpoint);
  superagent.get.should.have.been.calledWith(apiUrl);
});

// fetchCampaignById
test('fetchCampaignById should return result of a successful GET /campaigns/:id request', async () => {
  sandbox.stub(gambitContent, 'executeGet')
    .returns(Promise.resolve({ data: campaign }));

  const result = await gambitContent.fetchCampaignById(campaign.id);
  result.should.deep.equal(campaign);
  const endpoint = `${config.endpoints.campaigns}/${campaign.id}`;
  gambitContent.executeGet.should.have.been.calledWith(endpoint);
});
