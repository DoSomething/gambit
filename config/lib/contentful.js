'use strict';

module.exports = {
  clientOptions: {
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  },
  defaultCampaignId: process.env.CONTENTFUL_DEFAULT_CAMPAIGN_ID || 'default',
  /**
   *  The sequence we define properties here determines the order they appear
   *  in GET Gambit Campaigns API response. Should match the sequence defined
   *  in Contentful, which is based on the order in
   *  which our end user will see the messages.
   *
   *  { message_type: 'campaignMessageField'}
   */
  campaignFields: {
    menu_signedup_gambit: 'gambitSignupMenuMessage',
    menu_signedup_external: 'externalSignupMenuMessage',
    invalid_cmd_signedup: 'invalidSignupMenuCommandMessage',
    ask_quantity: 'askQuantityMessage',
    invalid_quantity: 'invalidQuantityMessage',
    ask_photo: 'askPhotoMessage',
    no_photo_sent: 'invalidPhotoMessage',
    ask_caption: 'askCaptionMessage',
    ask_why_participated: 'askWhyParticipatedMessage',
    menu_completed: 'completedMenuMessage',
    invalid_cmd_completed: 'invalidCompletedMenuCommandMessage',
    scheduled_relative_to_signup_date: 'scheduledRelativeToSignupDateMessage',
    scheduled_relative_to_reportback_date: 'scheduledRelativeToReportbackDateMessage',
    member_support: 'memberSupportMessage',
    campaign_closed: 'campaignClosedMessage',
    error_occurred: 'errorOccurredMessage',
  },
};
