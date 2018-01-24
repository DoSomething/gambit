'use strict';

module.exports = {
  customerIo: {
    userIdField: '{{customer.id}}',
    userPhoneField: '{{customer.phone}}',
  },
  /**
   * Our current smsBroadcastWebhook is setup in Blink
   */
  blink: {
    /*
     * Blink requires Basic Auth but it may not need it in the future.
     * This can be easily managed without additional code by adding/removing
     * the name:pass@ to the URL set in the .env file directly.
     */
    v1WebhookUrl: process.env.DS_BLINK_SMS_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1',
    webhookUrl: process.env.DS_BLINK_GAMBIT_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1',
  },
};
