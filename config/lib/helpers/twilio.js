'use strict';

module.exports = {
  // @see https://www.twilio.com/docs/api/messaging/message#delivery-related-errors
  undeliverableErrorCodes: {
    21203: 'International calling not enabled',
    21211: 'Invalid \'To\' Phone Number',
    21606: 'The \'From\' phone number provided is not a valid, message-capable Twilio phone number.',
    21610: 'Message cannot be sent to the \'To\' number because the customer has replied with STOP',
    21612: 'The \'To\' phone number is not currently reachable via SMS or MMS',
    21614: '\'To\' number is not a valid mobile number',
    30003: 'Unreachable destination handset',
    30005: 'Unknown destination handset',
    30006: 'Landline or unreachable carrier',
  },
};
