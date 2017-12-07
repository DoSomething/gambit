'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const rivescript = require('../../../../lib/rivescript');
const conversationFactory = require('../../../helpers/factories/conversation');

const mockConversation = conversationFactory.getValidConversation();
const mockText = 'The one true king';
const mockTopic = 'winterfell';
const mockMatch = '*';
const mockRivescriptReply = {
  text: mockText,
  topic: mockTopic,
  match: mockMatch,
};

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getRivescriptReply = require('../../../../lib/middleware/receive-message/rivescript-reply-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  t.context.req.inboundMessageText = 'King of the North';
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getRivescriptReply should inject vars into req', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();

  sandbox.stub(rivescript, 'getReply')
    .returns(Promise.resolve(mockRivescriptReply));

  // test
  await middleware(t.context.req, t.context.res, next);
  rivescript.getReply.should.have.been.called;
  t.context.req.rivescriptReplyText.should.equal(mockText);
  t.context.req.rivescriptReplyTopic.should.equal(mockTopic);
  t.context.req.rivescriptMatch.should.equal(mockMatch);
  next.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescriptReply should call sendErrorResponse if rivescript.getReply fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();

  sandbox.stub(rivescript, 'getReply')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});
