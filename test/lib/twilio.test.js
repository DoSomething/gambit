'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const config = require('../../config/lib/twilio');

// Module to test
const twilio = rewire('../../lib/twilio');

test.afterEach(() => {
  sandbox.restore();
  twilio.__set__('client', undefined);
});


test('createNewClient should create a new Twilio client by calling Twilio constructor', () => {
  const TwilioSpy = sandbox.spy();
  twilio.__set__('Twilio', TwilioSpy);

  twilio.createNewClient();
  TwilioSpy.should.have.been.calledWithNew;
  TwilioSpy.should.have.been.calledWith(config.accountSid, config.authToken);
});

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
