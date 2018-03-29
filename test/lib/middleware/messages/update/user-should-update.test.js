'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const messageFactory = require('../../../../helpers/factories/message');
const conversationFactory = require('../../../../helpers/factories/conversation');
// const stubs = require('../../../../helpers/stubs');

// setup "x.should.y" assertion style
const should = chai.should();
chai.use(sinonChai);

// module to be tested
const userShouldUpdateMiddleware = require('../../../../../lib/middleware/messages/update/user-should-update');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.analytics, 'addCustomAttributes')
    .returns(underscore.noop);
  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('userShouldUpdateMiddleware should respond with 204 if we do not need to update the user', async (t) => {
  // setup
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(underscore.noop);
  const next = sinon.stub();
  const middleware = userShouldUpdateMiddleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendResponseWithStatusCode.should.have.been.called;
  next.should.not.have.been.called;
});

test('userShouldUpdateMiddleware should populate userId and platformUserId and continue if we need to update the user', async (t) => {
  // setup
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(underscore.noop);
  const message = messageFactory.getValidOutboundReplyMessage();
  const conversation = conversationFactory.getValidConversation();
  const next = sinon.stub();
  const middleware = userShouldUpdateMiddleware();
  message.conversationId = conversation;
  t.context.req.message = message;
  t.context.req.undeliverableError = true;

  // test
  await middleware(t.context.req, t.context.res, next);
  should.exist(t.context.req.userId);
  should.exist(t.context.req.platformUserId);
  helpers.sendResponseWithStatusCode.should.not.have.been.called;
  next.should.have.been.called;
});
