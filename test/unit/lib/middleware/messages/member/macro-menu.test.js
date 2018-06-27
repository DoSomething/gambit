'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const campaignFactory = require('../../../../../helpers/factories/campaign');
const conversationFactory = require('../../../../../helpers/factories/conversation');

chai.should();
chai.use(sinonChai);

// module to be tested
const menuMacro = require('../../../../../../lib/middleware/messages/member/macro-menu');

const mockConversation = conversationFactory.getValidConversation();
const mockCampaign = campaignFactory.getValidCampaign();

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('menuMacro calls next if request is not a menu macro', async (t) => {
  const next = sinon.stub();
  const middleware = menuMacro();
  sandbox.stub(helpers.request, 'isMenuMacro')
    .returns(false);
  sandbox.stub(helpers.campaign, 'fetchRandomCampaignExcludingCampaignId')
    .returns(Promise.resolve(mockCampaign));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.campaign.fetchRandomCampaignExcludingCampaignId.should.not.have.been.called;
  next.should.have.been.called;
});
