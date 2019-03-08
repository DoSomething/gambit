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

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const changeTopic = require('../../../../../../lib/middleware/messages/signup/conversation-update');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.req.topic = topicFactory.getValidTopic();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});


test('updateConversation should call next on changeTopic success', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopic();
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.updateTopicIfChanged
    .should.have.been.calledWith(t.context.req, t.context.req.topic);
  helpers.sendErrorResponse.should.not.have.been.called;
  next.should.have.been.called;
});

test('updateConversation should call sendErrorResponse if changeTopic fails', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopic();
  const mockError = { status: 500 };
  sandbox.stub(helpers.request, 'changeTopic')
    .returns(Promise.reject(mockError));

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, mockError);
  next.should.not.have.been.called;
});
