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
const conversationFactory = require('../../../../../helpers/factories/conversation');

chai.should();
chai.use(sinonChai);

// module to be tested
const parseTopicMacro = require('../../../../../../lib/middleware/messages/member/macro-parse');

const mockConversation = conversationFactory.getValidConversation();

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'executeChangeTopicMacro')
    .returns(Promise.resolve({}));
  sandbox.stub(helpers.replies, 'continueTopic')
    .returns(underscore.noop);
  sandbox.stub(helpers.replies, 'rivescriptReply')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = mockConversation;
  t.context.req.macro = stubs.getRandomWord();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('parseTopicMacro executes changeTopicMacro if request isChangeTopicMacro', async (t) => {
  const next = sinon.stub();
  const middleware = parseTopicMacro();
  sandbox.stub(helpers.request, 'isChangeTopicMacro')
    .returns(true);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isChangeTopicMacro.should.have.been.called;
  next.should.not.have.been.called;
  helpers.request.executeChangeTopicMacro.should.have.been.calledWith(t.context.req);
  helpers.replies.continueTopic.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('parseTopicMacro should call sendErrorResponse if isChangeTopicMacro fails', async (t) => {
  const next = sinon.stub();
  const middleware = parseTopicMacro();
  const error = new Error('epic fail');
  sandbox.stub(helpers.request, 'isChangeTopicMacro')
    .throws(error);

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isChangeTopicMacro.should.have.been.called;
  next.should.not.have.been.called;
  helpers.request.executeChangeTopicMacro.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
