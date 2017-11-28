'use strict';

module.exports = {
  customerIo: {
    userPhoneField: '{{customer.phone}}',
  },
  twilio: {
    /**
     * @see https://www.twilio.com/docs/api/rest/test-credentials#test-sms-messages-example-1
     */
    testCredentialsFromNumber: process.env.TWILIO_TEST_FROM_NUMBER || '+15005550006',
  },
  blink: {
    /**
     * Our current smsBroadcastWebhook is setup in Blink
     *
     * Blink requires Basic Auth but it may not need it in the future.
     * This can be easily managed without additional code by adding/removing
     * the name:pass@ to the URL set in the .env file directly.
     */
    smsBroadcastWebhookUrl: process.env.DS_BLINK_SMS_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1',
  },
};
