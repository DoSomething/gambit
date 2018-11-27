'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const moment = require('moment');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const helpers = require('../../../../lib/helpers');
const stubs = require('../../../helpers/stubs');
const conversationFactory = require('../../../helpers/factories/conversation');

const resolvedPromise = Promise.resolve({});

chai.should();
chai.use(sinonChai);
const expect = chai.expect;

// module to be tested
const twilioHelper = require('../../../../lib/helpers/twilio');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

const mockTwilioRequestBody = stubs.twilio.getInboundRequestBody();

test.beforeEach((t) => {
  t.context.req = httpMocks.createRequest();
  t.context.req.body = mockTwilioRequestBody;
});

test.afterEach((t) => {
  t.context = {};
  sandbox.restore();
});

// parseBody
test('parseBody should inject vars into req', (t) => {
  sandbox.spy(helpers.request, 'setPlatform');
  sandbox.spy(twilioHelper, 'parseUserAddressFromReq');
  twilioHelper.parseBody(t.context.req);
  helpers.request.setPlatform.should.have.been.calledWith(t.context.req);
  twilioHelper.parseUserAddressFromReq.should.have.been.called;
  t.context.req.platformUserId.should.equal(mockTwilioRequestBody.From);
  t.context.req.should.have.property('platformUserAddress');
});

// parseUserAddressFromReq
test('parseUserAddressFromReq should return an object', (t) => {
  const result = twilioHelper.parseUserAddressFromReq(t.context.req);
  result.addr_city.should.equal(mockTwilioRequestBody.FromCity);
  result.addr_state.should.equal(mockTwilioRequestBody.FromState);
  result.addr_zip.should.equal(mockTwilioRequestBody.FromZip);
  result.country.should.equal(mockTwilioRequestBody.FromCountry);
});

// isBadRequestError
test('isBadRequestError should return boolean', (t) => {
  const badRequestError = { status: 400 };
  t.truthy(twilioHelper.isBadRequestError(badRequestError));
  const unauthorizedError = { status: 401 };
  t.falsy(twilioHelper.isBadRequestError(unauthorizedError));
});

// handleMessageCreationSuccess
test('handleMessageCreationSuccess saves Twilio delivery metadata to message', async () => {
  const smsConversation = conversationFactory.getValidConversation();
  const postMessageResponse = stubs.twilio.getPostMessageSuccess();
  sandbox.stub(smsConversation.lastOutboundMessage, 'save')
    .returns(resolvedPromise);

  await helpers.twilio
    .handleMessageCreationSuccess(postMessageResponse, smsConversation.lastOutboundMessage);

  // Mongoose Date schema type properties returns Date instance.
  const formattedQueuedAt = moment(
    smsConversation.lastOutboundMessage.metadata.delivery.queuedAt).format();

  smsConversation.lastOutboundMessage.save.should.have.been.called;
  expect(formattedQueuedAt).to.equal(postMessageResponse.dateCreated);
  expect(smsConversation.lastOutboundMessage.metadata.delivery.totalSegments)
    .to.equal(postMessageResponse.numSegments);
});

// handleMessageCreationFailure
test('handleMessageCreationFailure saves Twilio delivery failure metadata to message', async () => {
  const failedAt = moment().format();
  const smsConversation = conversationFactory.getValidConversation();
  const postMessageResponse = stubs.twilio.getPostMessageError();
  sandbox.stub(smsConversation.lastOutboundMessage, 'save')
    .returns(resolvedPromise);

  await helpers.twilio
    .handleMessageCreationFailure(
      postMessageResponse, smsConversation.lastOutboundMessage, failedAt);

  // Mongoose Date schema type properties returns Date instance.
  const formattedFailedAt = moment(
    smsConversation.lastOutboundMessage.metadata.delivery.failedAt).format();

  smsConversation.lastOutboundMessage.save.should.have.been.called;
  expect(formattedFailedAt).to.be.equal(failedAt);
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData).to.exist;
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData.code)
    .to.be.equal(postMessageResponse.code);
  expect(smsConversation.lastOutboundMessage.metadata.delivery.failureData.message)
    .to.be.equal(postMessageResponse.message);
});
