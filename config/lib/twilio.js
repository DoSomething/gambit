'use strict';

const useTwilioTestCreds = process.env.DS_GAMBIT_CONVERSATIONS_USE_TWILIO_TEST_CREDS || 'false';
const accountSid = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_ACCOUNT_SID :
  process.env.TWILIO_ACCOUNT_SID;
const authToken = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_AUTH_TOKEN :
  process.env.TWILIO_AUTH_TOKEN;

// @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters-From
const testFromNumber = process.env.TWILIO_TEST_FROM_NUMBER || '+15005550006';
// @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters-To
const testToNumber = process.env.TWILIO_TEST_TO_NUMBER || '+15005550006';

module.exports = {
  accountSid,
  authToken,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
  testFromNumber,
  testToNumber,
  useTwilioTestCreds,
  statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL,
};
