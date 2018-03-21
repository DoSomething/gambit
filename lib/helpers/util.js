'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const logger = require('../logger');
const UnprocessibleEntityError = require('../../app/exceptions/UnprocessibleEntityError');

const phoneUtil = PhoneNumberUtil.getInstance();

module.exports = {
  formatMobileNumber: function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
    logger.debug('formatMobileNumber params', { mobile });
    let error;
    if (!mobile) {
      error = new UnprocessibleEntityError('Mobile undefined.');
      throw error;
    }
    const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
    if (!phoneUtil.isValidNumber(phoneNumberObject)) {
      error = new UnprocessibleEntityError('Cannot format mobile number.');
      throw error;
    }
    const result = phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
    logger.debug('formatMobileNumber return', { result });
    return result;
  },
};
