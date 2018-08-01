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
const parseRivescriptReply = require('../../../../../../lib/middleware/messages/member/rivescript-reply-parse');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'rivescriptReply')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.conversation = conversationFactory.getValidConversation();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('parseRivescriptReply calls next if req.macro is set', async (t) => {
  const next = sinon.stub();
  const middleware = parseRivescriptReply();
  sandbox.stub(helpers.topic, 'isHardcodedTopicId')
    .returns(true);
  t.context.req.macro = stubs.getMacro();

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.topic.isHardcodedTopicId.should.not.have.been.called;
  next.should.have.been.called;
  helpers.replies.rivescriptReply.should.not.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});
