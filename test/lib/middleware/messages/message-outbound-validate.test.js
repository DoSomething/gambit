'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const validateOutbound = require('../../../../lib/middleware/messages/message-outbound-validate');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockUser = userFactory.getValidUser();
const defaultConfigStub = stubs.config.getMessageOutbound();
const supportConfigStub = stubs.config.getMessageOutbound(true);

// Setup!
test.beforeEach((t) => {
  sandbox.stub(helpers.request, 'setPlatformUserId')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponseWithSuppressHeaders')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.req.user = mockUser;
  t.context.req.platform = stubs.getPlatform();
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('validateOutbound calls sendErrorResponseWithSuppressHeaders if user is not subscriber', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(defaultConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(false);

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.user.isSubscriber.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateOutbound sends error if user is paused and config.shouldSendWhenPaused is false', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(defaultConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(true);
  sandbox.stub(helpers.user, 'isPaused')
    .returns(true);

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.user.isSubscriber.should.have.been.called;
  helpers.user.isPaused.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateOutbound calls sendErrorResponseWithSuppressHeaders if formatMobileNumber throws', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(defaultConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(true);
  sandbox.stub(helpers.user, 'isPaused')
    .returns(false);
  sandbox.stub(helpers, 'formatMobileNumber')
    .throws();

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.user.isSubscriber.should.have.been.called;
  helpers.user.isPaused.should.have.been.called;
  helpers.formatMobileNumber.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.have.been.called;
  next.should.not.have.been.called;
});

test('validateOutbound calls next if user validates', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(defaultConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(true);
  sandbox.stub(helpers.user, 'isPaused')
    .returns(false);
  sandbox.stub(helpers, 'formatMobileNumber')
    .returns(mockUser.mobile);

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.user.isSubscriber.should.have.been.called;
  helpers.user.isPaused.should.have.been.called;
  helpers.formatMobileNumber.should.have.been.called;
  helpers.request.setPlatformUserId.should.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
  next.should.have.been.called;
});

test('validateOutbound does not call formatMobileNumber if platform is not SMS', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(defaultConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(true);
  sandbox.stub(helpers.user, 'isPaused')
    .returns(false);
  sandbox.stub(helpers, 'formatMobileNumber')
    .returns(mockUser.mobile);
  t.context.req.platform = 'alexa';

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.user.isSubscriber.should.have.been.called;
  helpers.user.isPaused.should.have.been.called;
  helpers.formatMobileNumber.should.not.have.been.called;
  helpers.request.setPlatformUserId.should.not.have.been.called;
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
  next.should.have.been.called;
});

test('validateOutbound calls next if user is paused and config.shouldSendWhenPaused is true', (t) => {
  // setup
  const next = sinon.stub();
  const middleware = validateOutbound(supportConfigStub);
  sandbox.stub(helpers.user, 'isSubscriber')
    .returns(true);
  sandbox.stub(helpers.user, 'isPaused')
    .returns(true);
  t.context.req.platform = 'alexa';

  // test
  middleware(t.context.req, t.context.res, next);
  helpers.sendErrorResponseWithSuppressHeaders.should.not.have.been.called;
  next.should.have.been.called;
});
