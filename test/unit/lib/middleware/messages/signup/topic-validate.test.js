'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');
const campaignFactory = require('../../../../../helpers/factories/campaign');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

const templateStub = stubs.getSignupMessageTemplateName();
const textStub = stubs.getRandomMessageText();

// module to be tested
const validateTopic = require('../../../../../../lib/middleware/messages/signup/topic-validate');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setOutboundMessageTemplate')
    .returns(underscore.noop);
  sandbox.stub(helpers.request, 'setOutboundMessageText')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.campaign = campaignFactory.getValidCampaign();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

/**
 * Tests
 */
test('validateTopic calls request helper functions with campaign helper results', async (t) => {
  const next = sinon.stub();
  const middleware = validateTopic();
  sandbox.stub(helpers.campaign, 'getWebSignupMessageTemplateNameFromCampaign')
    .returns(templateStub);
  sandbox.stub(helpers.topic, 'getRenderedTextFromTopicAndTemplateName')
    .returns(textStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
  helpers.request
    .setOutboundMessageTemplate.should.have.been.calledWith(t.context.req, templateStub);
  helpers.request.setOutboundMessageText.should.have.been.calledWith(t.context.req, textStub);
});

test('validateTopic sends sendErrorResponse if getSignupMessageTemplateName throws', async (t) => {
  const next = sinon.stub();
  const middleware = validateTopic();
  sandbox.stub(helpers.campaign, 'getWebSignupMessageTemplateNameFromCampaign')
    .throws();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  next.should.have.not.been.called;
});
