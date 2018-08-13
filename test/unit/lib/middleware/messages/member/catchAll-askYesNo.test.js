'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const topicFactory = require('../../../../../helpers/factories/topic');

chai.should();
chai.use(sinonChai);

// module to be tested
const askYesNoCatchall = require('../../../../../../lib/middleware/messages/member/catchAll-askYesNo');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'sendReply')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('askYesNoCatchall should call replies.autoReply if request.shouldSendAutoReply is false', async (t) => {
  const next = sinon.stub();
  const middleware = askYesNoCatchall();
  sandbox.stub(helpers.topic, 'isAskYesNo')
    .returns(false);
  t.context.req.topic = topicFactory.getValidAutoReply();

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.topic.isAskYesNo.should.have.been.calledWith(t.context.req.topic);
  next.should.have.been.called;
  helpers.replies.sendReply.should.not.have.been.called;
});
