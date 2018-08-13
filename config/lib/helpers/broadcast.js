'use strict';

module.exports = {
  types: {
    askSubscriptionStatus: 'askSubscriptionStatus',
    askYesNo: 'askYesNo',
    autoReplyBroadcast: 'autoReplyBroadcast',
    photoPostBroadcast: 'photoPostBroadcast',
    textPostBroadcast: 'textPostBroadcast',
    legacy: 'broadcast',
  },
  default: {
    templates: {
      campaign: 'askSignup',
      topic: 'rivescript',
    },
  },
  customerIo: {
    userIdField: '{{customer.id}}',
  },
  blink: {
    webhookUrl: process.env.DS_BLINK_GAMBIT_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1',
  },
};
