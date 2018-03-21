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
  sandbox.stub(helpers.request, 'setUserId')
    .returns(noop);
  t.context.req.body = stubs.front.getInboundRequestBody();

  frontHelper.parseBody(t.context.req);
  helpers.request.setOutboundMessageText.should.have.been.called;
  // TODO: Add test for setPlatformUserId when Front Conversation is saved by mobile number.
  helpers.request.setUserId.should.have.been.called;
  t.context.req.should.have.property('agentId');
  t.context.req.should.have.property('frontConversationUrl');
});
