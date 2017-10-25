'use strict';

const useTwilioTestCreds = process.env.DS_GAMBIT_CONVERSATIONS_USE_TWILIO_TEST_CREDS || 'false';
const accountSid = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_ACCOUNT_SID :
  process.env.TWILIO_ACCOUNT_SID;
const authToken = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_AUTH_TOKEN :
  process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_TEST_FROM_NUMBER || '+15005550006';
// @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters-To
const toNumber = process.env.TWILIO_TEST_TO_NUMBER || '+15005550006';

module.exports = {
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  useTwilioTestCreds,
};
