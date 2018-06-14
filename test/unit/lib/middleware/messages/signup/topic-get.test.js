'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../../../lib/helpers');
const topicFactory = require('../../../../../helpers/factories/topic');

// stubs
const topicStub = topicFactory.getValidTopic();
const campaignIdStub = topicStub.campaign.id;

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getTopic = require('../../../../../../lib/middleware/messages/signup/topic-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'addBlinkSuppressHeaders')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendResponseWithStatusCode')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setTopic')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.campaignId = campaignIdStub;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('getTopic should call fetchByCampaignId and setTopic', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  sandbox.stub(helpers.topic, 'fetchByCampaignId')
    .returns(Promise.resolve([topicStub]));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.topic.fetchByCampaignId.should.have.been.calledWith(campaignIdStub);
  helpers.request.setTopic.should.have.been.calledWith(t.context.req, topicStub);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});

test('getTopic should send 204 status if no topics found for campaignId', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  sandbox.stub(helpers.topic, 'fetchByCampaignId')
    .returns(Promise.resolve(null));
  // TODO: Move this hardcoded message into config to DRY.
  const apiResponseMessage = 'Campaign does not have any topics.';

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode
    .should.have.been.calledWith(t.context.res, 204, apiResponseMessage);
  helpers.addBlinkSuppressHeaders.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
  helpers.request.setTopic.should.not.have.been.called;
  next.should.not.have.been.called;
});

test('getTopic should call sendErrorResponse if fetchByCampaignId fails', async (t) => {
  const next = sinon.stub();
  const middleware = getTopic();
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.topic, 'fetchByCampaignId')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
  next.should.not.have.been.called;
});
