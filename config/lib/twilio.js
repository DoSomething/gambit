'use strict';

let useTwilioTestCreds = process.env.DS_GAMBIT_CONVERSATIONS_USE_TWILIO_TEST_CREDS || 'false';

/**
 * TODO: We should be overriding this in the config/env/override-test.js,
 * but since it only overrides basic app variables it wouldn't work so we do it here.
 * It would be a good idea to import all configs into the main config/index.js and require
 * that everywhere, this way we could override any config through the env override files.
 */
if (process.env.NODE_ENV === 'test') {
  useTwilioTestCreds = 'true';
}

const accountSid = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_ACCOUNT_SID :
  process.env.TWILIO_ACCOUNT_SID;
const authToken = useTwilioTestCreds === 'true' ?
  process.env.TWILIO_TEST_AUTH_TOKEN :
  process.env.TWILIO_AUTH_TOKEN;

// @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-parameters-From
const testFromNumber = process.env.TWILIO_TEST_FROM_NUMBER || '+15005550006';

module.exports = {
  accountSid,
  authToken,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
  testFromNumber,
  useTwilioTestCreds,
  statusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL,
};
