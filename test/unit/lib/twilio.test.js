'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const underscore = require('underscore');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const Twilio = require('twilio');

const stubs = require('../../helpers/stubs');
const config = require('../../../config/lib/twilio');

// Module to test
const twilio = rewire('../../../lib/twilio');

const mockToNumber = stubs.getMobileNumber();
const mockMessageText = stubs.getRandomMessageText();


test.afterEach(() => {
  sandbox.restore();
  twilio.__set__('client', undefined);
  twilio.__set__('config', config);
  twilio.__set__('Twilio', undefined);
});

// createNewClient
test('createNewClient should create a new Twilio client by calling Twilio constructor', () => {
  const TwilioSpy = sandbox.spy();
  twilio.__set__('Twilio', TwilioSpy);

  twilio.createNewClient();
  TwilioSpy.should.have.been.calledWithNew;
  TwilioSpy.should.have.been.calledWith(config.accountSid, config.authToken);
});

test('createNewClient should throw when Twilio constructor fails', (t) => {
  const failConfig = underscore.extend({}, config, {
    authToken: 'epicFail',
  });
  twilio.__set__('config', failConfig);

  t.throws(() => twilio.createNewClient());
});

// getClient
test('getClient should return the existing Twilio client if already created', () => {
  // setup
  const TwilioSpy = sandbox.spy();
  twilio.__set__('Twilio', TwilioSpy);
  const newClient = twilio.getClient();
  const sameClient = twilio.getClient();

  // test
  TwilioSpy.should.have.been.calledWithNew;
  TwilioSpy.should.have.been.calledOnce;
  newClient.should.be.equal(sameClient);
});

// useTwilioTestCreds
test('useTwilioTestCreds should return true while testing', () => {
  const result = twilio.useTwilioTestCreds();
  result.should.equal(true);
});

// getMessagePayload
test('getMessagePayload should return object with valid to/from numbers when not testing', () => {
  sandbox.stub(twilio, 'useTwilioTestCreds').returns(false);
  const result = twilio.getMessagePayload(mockToNumber, mockMessageText);
  result.from.should.equal(config.fromNumber);
  result.to.should.equal(mockToNumber);
  result.body.should.equal(mockMessageText);
  result.smartEncoded.should.equal(true);
});

test('getMessagePayload should return object with test from number when testing', () => {
  sandbox.stub(twilio, 'useTwilioTestCreds').returns(true);
  const result = twilio.getMessagePayload(mockToNumber, mockMessageText);
  result.from.should.equal(config.testFromNumber);
  result.to.should.equal(mockToNumber);
  result.body.should.equal(mockMessageText);
  result.smartEncoded.should.equal(true);
});

// postMessage
test('postMessage should call Twilio client.messages.create', async () => {
  const twilioApiStub = new Twilio(config.accountSid, config.authToken);
  const mockTwilioResponse = {
    status: 'queued',
    sid: 'SM7a5268476ddf4773923134d7ba5be030',
  };
  const mockPayload = twilio.getMessagePayload(mockToNumber, mockMessageText);
  sandbox.stub(twilioApiStub.messages, 'create')
    .returns(Promise.resolve(mockTwilioResponse));
  sandbox.stub(twilio, 'getClient')
    .returns(twilioApiStub);
  sandbox.stub(twilio, 'getMessagePayload')
    .returns(mockPayload);

  const result = await twilio.postMessage(mockToNumber, mockMessageText);
  twilio.getMessagePayload.should.have.been.calledWith(mockToNumber, mockMessageText);
  twilioApiStub.messages.create.should.have.been.calledWith(mockPayload);
  result.should.deep.equal(mockTwilioResponse);
});
