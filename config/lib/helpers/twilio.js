'use strict';

module.exports = {
  // @see https://www.twilio.com/docs/api/messaging/message#delivery-related-errors
  // 30006: Landline or unreachable carrier
  //        Example: https://www.twilio.com/console/sms/logs/SM933e25ea371f4f10a213aef5180245e1
  // 30004: Message blocked
  // 30008: Unknown error
  //        Example: https://www.twilio.com/console/sms/logs/SMdc6b3e74246c437ab3328f346ce86ef4
  // 30003: Unreachable destination handset
  //        Example: https://www.twilio.com/console/sms/logs/SM4367f21c9cfb40e2b87216227a20a109
  undeliverableErrorCodes: {
    30006: 'Landline or unreachable carrier',
    // 30008: 'Unknown error',
    // TODO: Not sure about these ones yet
    // 30004: 'Message blocked',
    // 30003: 'Unreachable destination handset',
  },
};
