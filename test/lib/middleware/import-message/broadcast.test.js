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
const contentful = require('../../../../lib/contentful');
const stubs = require('../../../helpers/stubs');
const broadcastFactory = require('../../../helpers/factories/broadcast');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const getBroadcast = require('../../../../lib/middleware/import-message/broadcast-get');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const sendErrorResponseStub = underscore.noop;
const mockBroadcast = broadcastFactory.getValidBroadcast();
const broadcastLookupStub = () => Promise.resolve(mockBroadcast);
const broadcastLookupFailStub = () => Promise.reject({ message: 'Epic fail' });
const broadcastLookupNotFoundStub = () => Promise.reject({ status: 404 });

// Setup!
test.beforeEach((t) => {
  sandbox.stub(analyticsHelper, 'addParameters')
    .returns(underscore.noop);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(sendErrorResponseStub);

  // setup req, res mocks
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

// Cleanup!
test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getBroadcast should inject vars into the req object when found in Contentful', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  t.context.req.broadcastId = stubs.getBroadcastId();
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.have.been.called;
  t.context.req.broadcast.should.deep.equal(mockBroadcast);
  // TODO: This should be called! :(
  next.should.have.been.called;
});

test('getBroadcast should call sendErrorResponse if broadcastId not found', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  t.context.req.broadcastId = 'notFound';
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupNotFoundStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});

test('getBroadcast should call sendErrorResponse if contentful.fetchBroadcast fails', async (t) => {
  // setup
  const next = sinon.stub();
  const middleware = getBroadcast();
  t.context.req.broadcastId = 'fail';
  sandbox.stub(contentful, 'fetchBroadcast')
    .callsFake(broadcastLookupFailStub);

  // test
  await middleware(t.context.req, t.context.res, next);
  analyticsHelper.addParameters.should.have.been.called;
  helpers.sendErrorResponse.should.have.been.called;
  t.context.req.should.not.have.property('broadcast');
  next.should.not.have.been.called;
});
