'use strict';

const useTwilioTestCreds = process.env.DS_GAMBIT_CONVERSATIONS_SHOULD_USE_TWILIO_TEST_CREDS || 'false';
const accountSid = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_ACCOUNT_SID :
  process.env.TWILIO_ACCOUNT_SID;
const authToken = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_AUTH_TOKEN :
  process.env.TWILIO_AUTH_TOKEN;
const fromNumber = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_FROM_NUMBER :
  process.env.TWILIO_FROM_NUMBER;

module.exports = {
  accountSid,
  authToken,
  fromNumber,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  useTwilioTestCreds,
};
