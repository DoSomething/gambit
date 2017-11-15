'use strict';

// env variables
require('dotenv').config();

// Libraries
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

// App Modules
const contentful = require('../../lib/contentful.js');
const stubs = require('../helpers/stubs.js');

const broadcastId = stubs.getBroadcastId();

// Module to test
const helpers = require('../../lib/helpers');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Setup!
test.beforeEach((t) => {
  // setup spies
  sandbox.spy(helpers, 'sendErrorResponse');

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

// getBroadcast
test('getBroadcast should return a promise that will resolve in a broadcast when found', async (t) => {
  // setup
  t.context.req.broadcastId = broadcastId;
  sandbox.stub(contentful, 'fetchBroadcast')
    .returns(Promise.resolve({ id: 'test' }));

  // test
  const broadcast = await helpers.getBroadcast(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.not.have.been.called;
  broadcast.should.not.be.empty;
});

/*
test('getBroadcast should send a 404 response when no broadcast is found', async (t) => {
  // setup
  t.context.req.broadcastId = broadcastId;
  sandbox.stub(contentful, 'fetchBroadcast')
    .returns(Promise.resolve(''));

  // test
  await helpers.getBroadcast(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, 404);
});

test('getBroadcast should send Error response when it fails retrieving a broadcast', async (t) => {
  // setup
  t.context.req.broadcastId = broadcastId;
  sandbox.stub(contentful, 'fetchBroadcast')
    .returns(Promise.reject(false));

  // test
  await helpers.getBroadcast(t.context.req, t.context.res);
  helpers.sendErrorResponse.should.have.been.called;
});
*/
