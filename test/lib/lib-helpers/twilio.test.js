'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const stubs = require('../../helpers/stubs');

chai.should();
chai.use(sinonChai);

// module to be tested
const twilioHelper = require('../../../lib/helpers/twilio');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

const mockTwilioRequestBody = stubs.getMockInboundTwilioRequestBody();

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  t.context.req.body = mockTwilioRequestBody;
});

test.afterEach(() => {
  sandbox.restore();
});

// parseBody
test('parseBody should inject vars into req', (t) => {
  sandbox.spy(twilioHelper, 'parseUserAddressFromReq');
  twilioHelper.parseBody(t.context.req);
  twilioHelper.parseUserAddressFromReq.should.have.been.called;
  t.context.req.platformUserId.should.equal(mockTwilioRequestBody.From);
  t.context.req.should.have.property('platformUserAddress');
});

// hasLocation
test('parseUserAddressFromReq should return an object', (t) => {
  const result = twilioHelper.parseUserAddressFromReq(t.context.req);
  result.addr_city.should.equal(mockTwilioRequestBody.FromCity);
  result.addr_state.should.equal(mockTwilioRequestBody.FromState);
  result.addr_zip.should.equal(mockTwilioRequestBody.FromZip);
  result.country.should.equal(mockTwilioRequestBody.FromCountry);
});
