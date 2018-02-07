'use strict';

module.exports = {
  clientOptions: {
    baseUri: process.env.FRONT_API_BASEURI || 'https://api2.frontapp.com',
    apiSecret: process.env.FRONT_API_SECRET,
    apiToken: process.env.FRONT_API_TOKEN,
    signatureAlgorithm: 'sha1',
    signatureEncoding: 'base64',
    signatureHeader: 'x-front-signature',
    validationDisabled: process.env.FRONT_VALIDATION_DISABLED || false,
  },
  channels: {
    support: process.env.FRONT_API_SUPPORT_CHANNEL,
  },
};
