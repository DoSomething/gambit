'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const logger = require('../logger');
const UnprocessibleEntityError = require('../../app/exceptions/UnprocessibleEntityError');

const phoneUtil = PhoneNumberUtil.getInstance();

module.exports = {
  formatMobileNumber: function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
    logger.debug('formatMobileNumber params', { mobile });
    if (!mobile) {
      throw new UnprocessibleEntityError('Mobile undefined.');
    }
    const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
    if (!phoneUtil.isValidNumber(phoneNumberObject)) {
      throw new UnprocessibleEntityError('Cannot format mobile number.');
    }
    const result = phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
    logger.debug('formatMobileNumber return', { result });
    return result;
  },
};
