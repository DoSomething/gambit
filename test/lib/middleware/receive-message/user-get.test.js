'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../../lib/helpers');
const analyticsHelper = require('../../../../lib/helpers/analytics');
const Conversation = require('../../../../app/models/Conversation');
const stubs = require('../../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getUser = require('../../../../lib/middleware/receive-message/user-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();
const conversation = new Conversation();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockUser = stubs.middleware.getConversation.getConversationFromLookup();
const userLookupStub = () => Promise.resolve(mockUser);
const userLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const userLookupNotFoundStub = () => Promise.reject({ status: 404 });

// Setup!
test.beforeEach((t) => {
  sandbox.stub(analyticsHelper, 'addParameters')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = conversation;
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getUser should inject a user into the req object when found in Northstar', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(conversation, 'getNorthstarUser')
    .callsFake(userLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('user');
  // TODO: Mock user
  // const user = t.context.req.user;

  // const properties = ['id', 'mobile', 'created_at', 'sms_status'];
  // properties.forEach(property => user.should.have.property(property));
  analyticsHelper.addParameters.should.have.been.called;
  next.should.have.been.called;
});

test('getUser should call next if Conversation.getNorthstarUser response is null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(conversation, 'getNorthstarUser')
    .callsFake(userLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.have.been.called;
});

test('getUser should call sendErrorResponse if Conversation.getNorthstarUser fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getUser();
  sandbox.stub(conversation, 'getNorthstarUser')
    .callsFake(userLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addParameters.should.not.have.been.called;
  t.context.req.should.not.have.property('user');
  next.should.not.have.been.called;
});
