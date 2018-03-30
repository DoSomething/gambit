'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const stubs = require('../../../../helpers/stubs');

// setup "x.should.y" assertion style
const should = chai.should();
chai.use(sinonChai);

// module to be tested
const paramsMiddleware = require('../../../../../lib/middleware/messages/update/params');

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

test('paramsMiddleware should transparently call next when the update is not a delivery status update', async (t) => {
  // setup
  sandbox.spy(paramsMiddleware, 'parseDeliveryMetadataProperties');
  const next = sinon.stub();
  const middleware = paramsMiddleware.middleware();

  // test
  await middleware(t.context.req, t.context.res, next);
  paramsMiddleware.parseDeliveryMetadataProperties.should.not.have.been.called;
  next.should.have.been.called;
});

test('paramsMiddleware should call parseDeliveryMetadataProperties on delivery status updates', async (t) => {
  // setup
  sandbox.spy(paramsMiddleware, 'parseDeliveryMetadataProperties');
  const update = stubs.twilio.getDeliveredMessageUpdate();
  const next = sinon.stub();
  const middleware = paramsMiddleware.middleware();
  t.context.req.body = update;

  // test
  await middleware(t.context.req, t.context.res, next);
  paramsMiddleware.parseDeliveryMetadataProperties.should.have.been.called;
  t.context.req.deliveryStatusUpdate.should.be.true;
  should.not.exist(t.context.req.deliveryFailureData);
  next.should.have.been.called;
});

test('paramsMiddleware should call parseDeliveryMetadataProperties and populate req.undeliverableError on failure status updates with an undeliverable error code', async (t) => {
  // setup
  sandbox.spy(paramsMiddleware, 'parseDeliveryMetadataProperties');
  const update = stubs.twilio.getFailedMessageUpdate(true);
  const next = sinon.stub();
  const middleware = paramsMiddleware.middleware();
  t.context.req.body = update;

  // test
  await middleware(t.context.req, t.context.res, next);
  paramsMiddleware.parseDeliveryMetadataProperties.should.have.been.called;
  t.context.req.deliveryStatusUpdate.should.be.true;
  should.exist(t.context.req.deliveryFailureData);
  should.exist(t.context.req.undeliverableError);
  next.should.have.been.called;
});
