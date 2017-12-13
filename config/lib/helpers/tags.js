'use strict';

module.exports = {
  customUrl: {
    url: process.env.DS_GAMBIT_CUSTOM_URL || 'https://dosomething.turbovote.org',
    queryParamName: process.env.DS_GAMBIT_CUSTOM_URL_QUERY_PARAM || 'referral-code',
    queryValue: {
      separator: ',',
      fieldSuffix: ':',
      fields: {
        userId: 'user',
        campaignRunId: 'campaign',
      },
    },
  },
  tags: {
    customUrl: 'custom_url',
  },
};
