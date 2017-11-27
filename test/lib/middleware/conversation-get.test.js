'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');
const Promise = require('bluebird');

const helpers = require('../../../lib/helpers');
const analyticsHelper = require('../../../lib/helpers/analytics');
const Conversation = require('../../../app/models/Conversation');
const stubs = require('../../helpers/stubs');
const conversationFactory = require('../../helpers/factories/conversation');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getConversation = require('../../../lib/middleware/conversation-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockConversation = conversationFactory.getValidConversation();
const conversationLookupStub = () => Promise.resolve(mockConversation);
const conversationLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const conversationLookupNotFoundStub = () => Promise.resolve(null);

// Setup!
test.beforeEach((t) => {
  sandbox.stub(Conversation, 'getFromReq')
    .callsFake(conversationLookupStub)
    .withArgs('fail')
    .callsFake(conversationLookupFailStub)
    .withArgs('notFound')
    .callsFake(conversationLookupNotFoundStub);

  sandbox.stub(analyticsHelper, 'addParameters')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);


  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();

  // add params
  t.context.req.platform = stubs.getPlatform();
  t.context.req.platformUserId = stubs.getPlatformUserId();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getConversation should inject a conversation into the req object when found in DB', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getConversation();

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('conversation');
  const conversation = t.context.req.conversation;
  conversation.should.deep.equal(mockConversation);
  analyticsHelper.addParameters.should.have.been.called;
  next.should.have.been.called;
});

test('getConversation should call next if Conversation.getFromReq response is null', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getConversation();

  // test
  await middleware('notFound', t.context.res, next);
  analyticsHelper.addParameters.should.not.have.been.called;
  next.should.have.been.called;
});

test('getConversation should call sendErrorResponse if Conversation.getFromReq fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getConversation();

  // test
  await middleware('fail', t.context.res, next);
  helpers.sendErrorResponse.should.have.been.called;
  analyticsHelper.addParameters.should.not.have.been.called;
  next.should.not.have.been.called;
});
