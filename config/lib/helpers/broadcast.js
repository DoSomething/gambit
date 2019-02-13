'use strict';

module.exports = {
  types: {
    askMultipleChoice: 'askMultipleChoice',
    askSubscriptionStatus: 'askSubscriptionStatus',
    askVotingPlanStatus: 'askVotingPlanStatus',
    askYesNo: 'askYesNo',
    autoReplyBroadcast: 'autoReplyBroadcast',
    photoPostBroadcast: 'photoPostBroadcast',
    textPostBroadcast: 'textPostBroadcast',
    legacy: 'broadcast',
  },
  customerIo: {
    userIdField: '{{customer.id}}',
  },
  blink: {
    webhookUrl: process.env.DS_BLINK_GAMBIT_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1',
  },
};
