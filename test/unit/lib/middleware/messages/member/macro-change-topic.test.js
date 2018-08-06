'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');

chai.should();
chai.use(sinonChai);

// module to be tested
const changeTopicMacro = require('../../../../../../lib/middleware/messages/member/macro-change-topic');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.replies, 'continueTopic')
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

test('changeTopicMacro calls next if request not isChangeTopicMacro', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  sandbox.stub(helpers.request, 'isChangeTopicMacro')
    .returns(false);
  sandbox.stub(helpers.request, 'executeChangeTopicMacro')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isChangeTopicMacro.should.have.been.called;
  next.should.have.been.called;
  helpers.request.executeChangeTopicMacro.should.not.have.been.called;
});

test('changeTopicMacro executes changeTopicMacro if request isChangeTopicMacro', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  sandbox.stub(helpers.request, 'isChangeTopicMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeChangeTopicMacro')
    .returns(Promise.resolve());

  // test
  await middleware(t.context.req, t.context.res, next);
  helpers.request.isChangeTopicMacro.should.have.been.called;
  next.should.not.have.been.called;
  helpers.request.executeChangeTopicMacro.should.have.been.calledWith(t.context.req);
  helpers.replies.continueTopic.should.have.been.calledWith(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('changeTopicMacro should call sendErrorResponse if executeChangeTopicMacro fails', async (t) => {
  const next = sinon.stub();
  const middleware = changeTopicMacro();
  const error = { message: 'Epic fail' };
  sandbox.stub(helpers.request, 'isChangeTopicMacro')
    .returns(true);
  sandbox.stub(helpers.request, 'executeChangeTopicMacro')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res, next);
  next.should.not.have.been.called;
  helpers.request.executeChangeTopicMacro.should.have.been.called;
  helpers.replies.continueTopic.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
