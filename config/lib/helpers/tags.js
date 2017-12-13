'use strict';

module.exports = {
  customUrl: {
    url: process.env.DS_GAMBIT_CUSTOM_URL || 'https://dosomething.turbovote.org',
    queryParamName: process.env.DS_GAMBIT_CUSTOM_URL_QUERY_PARAM || 'referral-code',
  },
  tags: {
    customUrl: 'custom_url',
  },
};
