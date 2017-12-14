'use strict';

module.exports = {
  // Tags used in message templates.
  tags: {
    customUrl: 'custom_url',
  },
  /**
   * The customUrl tag should return a personzlied link to the User in format:
   * dosomething.turbovote.org?referral-code=user:5745b207469c6495618b4697,campaign:7944
   */
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

};
