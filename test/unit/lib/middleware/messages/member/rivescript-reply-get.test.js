'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const conversationFactory = require('../../../../../helpers/factories/conversation');
const userFactory = require('../../../../../helpers/factories/user');
const stubs = require('../../../../../helpers/stubs');

const macroHelper = helpers.macro;
const mockConversation = conversationFactory.getValidConversation();
const mockText = 'The one true king';
const mockTopic = 'winterfell';
const mockMatch = '*';
const mockRivescriptReply = {
  text: mockText,
  topic: mockTopic,
  match: mockMatch,
};
const mockUser = userFactory.getValidUser();

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getRivescriptReply = require('../../../../../../lib/middleware/messages/member/rivescript-reply-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  t.context.req.inboundMessageText = stubs.getRandomMessageText();
  t.context.res = httpMocks.createResponse();
  sandbox.spy(t.context.res, 'send');
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
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.resolve(mockRivescriptReply));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.getRivescriptReply.should.have.been.calledWith(t.context.req);
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
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.reject(new Error()));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.getRivescriptReply.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getRivescriptReply should set req.macro if rivescript.getReplyText is a macro', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.resolve(mockRivescriptReply));
  sandbox.stub(macroHelper, 'isMacro')
    .returns(mockText);

  // test
  await middleware(t.context.req, t.context.res, next);
  macroHelper.isMacro.should.have.been.called;
  t.context.req.macro.should.equal(mockText);
  next.should.have.been.called;
});

test('getRivescriptReply should not set req.macro if rivescript.getReplyText is not a macro', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.resolve(mockRivescriptReply));
  sandbox.stub(macroHelper, 'isMacro')
    .returns(null);

  // test
  await middleware(t.context.req, t.context.res, next);
  macroHelper.isMacro.should.have.been.called;
  t.falsy(t.context.req.macro);
  next.should.have.been.called;
});

test('getRivescriptReply should not set req.macro if helpers.macro.isMacro fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.resolve(mockRivescriptReply));
  sandbox.stub(macroHelper, 'isMacro').throws();

  // test
  await middleware(t.context.req, t.context.res, next);
  macroHelper.isMacro.should.have.been.called;
  next.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
});

test('getRivescriptReply should send data with user and reply if request is twilioStudio', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getRivescriptReply();
  sandbox.stub(helpers.request, 'getRivescriptReply')
    .returns(Promise.resolve(mockRivescriptReply));
  sandbox.stub(helpers.request, 'isTwilioStudio')
    .returns(true);
  t.context.req.user = mockUser;
  const data = {
    user: mockUser,
    reply: mockRivescriptReply,
  };

  // test
  await middleware(t.context.req, t.context.res, next);
  t.context.res.send.should.have.been.calledWith({ data });
});
