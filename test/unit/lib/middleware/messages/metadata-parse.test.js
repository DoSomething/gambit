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
chai.should();
chai.use(sinonChai);

// module to be tested
const parseMetadata = require('../../../../../lib/middleware/messages/metadata-parse');

const mockRequestId = stubs.getRequestId();

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers.analytics, 'addCustomAttributes')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('parseMetadata injects properties into req and res', (t) => {
  const next = sinon.stub();
  const middleware = parseMetadata();

  // test
  middleware(t.context.req, t.context.res, next);
  t.context.req.should.have.property('metadata');
  t.context.req.attachments.should.have.property('inbound');
  t.context.req.attachments.should.have.property('outbound');
  t.context.req.should.respondTo('isARetryRequest');
  t.context.req.metadata.should.have.property('requestId');
  t.context.req.metadata.should.not.have.property('retryCount');
});

test('parseMetadata injects req.requestId into req and res if exists', (t) => {
  const next = sinon.stub();
  t.context.req.headers['x-request-id'] = mockRequestId;
  const middleware = parseMetadata();

  // test
  middleware(t.context.req, t.context.res, next);
  t.context.req.metadata.requestId.should.equal(mockRequestId);
  t.context.res.metadata.requestId.should.equal(mockRequestId);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ requestId: mockRequestId });
});

test('parseMetadata injects req.retryCount into req if exists', (t) => {
  const next = sinon.stub();
  const retryCount = 20;
  t.context.req.headers['x-blink-retry-count'] = retryCount;
  const middleware = parseMetadata();

  // test
  middleware(t.context.req, t.context.res, next);
  t.context.req.metadata.retryCount.should.equal(retryCount);
  helpers.analytics.addCustomAttributes.should.have.been.calledWith({ retryCount });
});
