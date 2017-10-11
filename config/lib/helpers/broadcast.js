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
};
