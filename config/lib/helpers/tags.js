'use strict';

module.exports = {
  // Tags used in message templates.
  tags: {
    customUrl: 'custom_url',
    user: 'user',
  },
  /**
   * The customUrl tag should return a custom link with Conversation variables set in query string:
   * e.g. http://ds.puppetsloth.mx?referral-code=user:5745b207469c69618b46d97,campaign:97,source:sms
   */
  customUrl: {
    url: process.env.DS_GAMBIT_CUSTOM_URL || 'https://dosomething.turbovote.org',
    queryParamName: process.env.DS_GAMBIT_CUSTOM_URL_QUERY_PARAM || 'r',
    queryValue: {
      separator: ',',
      fieldSuffix: ':',
      fields: {
        userId: 'user',
        campaignId: 'campaignID',
        campaignRunId: 'campaignRunID',
        platform: 'source',
      },
    },
  },
};
