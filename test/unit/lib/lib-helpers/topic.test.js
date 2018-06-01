'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const defaultTopicTriggerFactory = require('../../../helpers/factories/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const topicHelper = require('../../../../lib/helpers/topic');

const replyTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
const redirectTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// fetchRivescript
test('fetchAllDefaultTopicTriggers should call parseDefaultTopicTrigger on gambitCampaigns.fetchDefaultTopicTriggers success', async () => {
  const mockResponse = [replyTrigger, redirectTrigger];
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve(mockResponse));
  sandbox.stub(topicHelper, 'parseDefaultTopicTrigger')
    .returns(replyTrigger);

  const result = await topicHelper.fetchAllDefaultTopicTriggers();
  mockResponse.forEach((item) => {
    topicHelper.parseDefaultTopicTrigger.should.have.been.calledWith(item);
  });
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  result.should.deep.equal([replyTrigger, replyTrigger]);
});

test('fetchRivescript should throw on gambitCampaigns.fetchDefaultTopicTriggers fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(topicHelper, 'parseDefaultTopicTrigger')
    .returns(replyTrigger);

  const result = await t.throws(topicHelper.fetchAllDefaultTopicTriggers());
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  topicHelper.parseDefaultTopicTrigger.should.not.have.been.called;
  result.should.deep.equal(mockError);
});
