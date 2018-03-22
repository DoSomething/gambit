'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const frontClient = require('../../../lib/front');
const helpers = require('../../../lib/helpers');
const stubs = require('../../helpers/stubs');

chai.should();
chai.use(sinonChai);

// module to be tested
const frontHelper = require('../../../lib/helpers/front');

const sandbox = sinon.sandbox.create();

const noop = underscore.noop;
const resolvedPromise = Promise.resolve();

test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setUserId')
    .returns(noop);
  sandbox.stub(helpers.request, 'setPlatformUserId')
    .returns(noop);
  t.context.req = httpMocks.createRequest();
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

test('getConversationByUrl should call frontClient.get', async () => {
  sandbox.stub(frontClient, 'get')
    .returns(resolvedPromise);
  const url = stubs.front.getConversationUrl();

  await frontHelper.getConversationByUrl(url);
  frontClient.get.should.have.been.calledWith(url);
});

test('isConversationArchived should return boolean', (t) => {
  const archivedConversation = stubs.front.getConversationSuccessBody();
  t.truthy(frontHelper.isConversationArchived(archivedConversation));

  const openConversation = stubs.front.getConversationSuccessBody('open');
  t.falsy(frontHelper.isConversationArchived(openConversation));
});

test('parseBody should inject vars into req', (t) => {
  sandbox.stub(helpers.request, 'setOutboundMessageText')
    .returns(noop);
  sandbox.stub(helpers.util, 'formatMobileNumber')
    .throws();
  t.context.req.body = stubs.front.getInboundRequestBody();

  frontHelper.parseBody(t.context.req);
  helpers.request.setOutboundMessageText.should.have.been.called;
  helpers.util.formatMobileNumber.should.have.been.called;
  helpers.request.setUserId.should.have.been.called;
  helpers.request.setPlatformUserId.should.not.have.been.called;
  t.context.req.should.have.property('agentId');
  t.context.req.should.have.property('frontConversationUrl');
});

test('parseBody should call setPlatformUserId if Front message is sent to a mobile number', (t) => {
  sandbox.stub(helpers.request, 'setOutboundMessageText')
    .returns(noop);
  const mobile = stubs.getMobileNumber();
  sandbox.stub(helpers.util, 'formatMobileNumber')
    .returns(mobile);
  t.context.req.body = stubs.front.getInboundRequestBody();

  frontHelper.parseBody(t.context.req);
  helpers.request.setOutboundMessageText.should.have.been.called;
  helpers.util.formatMobileNumber.should.have.been.called;
  helpers.request.setUserId.should.not.have.been.called;
  helpers.request.setPlatformUserId.should.have.been.calledWith(t.context.req, mobile);
  t.context.req.should.have.property('agentId');
  t.context.req.should.have.property('frontConversationUrl');
});
