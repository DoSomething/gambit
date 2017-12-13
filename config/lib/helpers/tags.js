'use strict';

module.exports = {
  customUrl: process.env.DS_GAMBIT_CUSTOM_URL || 'https://dosomething.turbovote.org',
  customUrlQueryParam: process.env.DS_GAMBIT_CUSTOM_URL_QUERY_PARAM || 'referral-code',
  tags: {
    customUrl: 'custom_url',
  },
};
