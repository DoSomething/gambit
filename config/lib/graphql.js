'use strict';

const campaignFields = `
  legacyCampaign {
    campaignId
  }
  campaign {
    id
    endDate
    internalTitle
  }
`;

const campaignTopicFields = `
  topic {
    id
    ${campaignFields}
  }
`;

const campaignTransitionTypes = `
  ...autoReplyCampaignTransition
  ...photoPostCampaignTransition
  ...textPostCampaignTransition
`;

const campaignTransitionFields = `
  id
  text
`;

const campaignTopicTransitionFragments = `
  fragment autoReplyCampaignTransition on AutoReplyTransition {
    ${campaignTransitionFields}
    topic {
      id
      contentType
      ...autoReplyCampaign
    }
  }
  fragment photoPostCampaignTransition on PhotoPostTransition {
    ${campaignTransitionFields}
    topic {
      id
      contentType
      ...photoPostCampaign
    }
  }
  fragment textPostCampaignTransition on TextPostTransition {
    ${campaignTransitionFields}
    topic {
      id
      contentType
      ...textPostCampaign
    }
  }
`;

const campaignTopicFragments = `
  fragment autoReplyCampaign on AutoReplyTopic {
    ${campaignFields}
  }
  fragment photoPostCampaign on PhotoPostTopic {
    actionId
    ${campaignFields}
  }
  fragment textPostCampaign on TextPostTopic {
    actionId
    ${campaignFields}
  }
`;

const actionFields = `
  action {
    id
    name
    campaignId
  }
`;

/**
 * TODO: Fetch the AskMultipleChoiceBroadcastTopic choice topics to validate that they don't change
 * topic to a campaign that has ended.
 */
const fetchBroadcastById = `
  query getBroadcastById($id: String!) {
    broadcast(id: $id) {
      id
      name
      text
      attachments {
        url
      }
      contentType
      ... on AskVotingPlanStatusBroadcastTopic {
        # need to ask for saidVotedTransition so we can receive action info
        # since it depends on its topic!
        saidVotedTransition {
          ${campaignTransitionTypes}
        }
        ${actionFields}
      }
      ... on AskYesNoBroadcastTopic {
        saidYesTransition {
          ${campaignTransitionTypes}
        }
        ${actionFields}
      }
      ... on AutoReplyBroadcast {
        topic {
          id
        }
      }
      ... on PhotoPostBroadcast {
        ${actionFields}
        topic {
          ...photoPostCampaign
        }
      }
      ... on TextPostBroadcast {
        ${actionFields}
        topic {
          ...textPostCampaign
        }
      }
    }
  }
  ${campaignTopicFragments}
  ${campaignTopicTransitionFragments}
`;

const fetchConversationTriggers = `
  query getConversationTriggers {
    conversationTriggers {
      trigger
      response {
        contentType
        id
        ... on AskMultipleChoiceBroadcastTopic {
          id
          text
        }
        ... on FaqAnswerTopic {
          text
        }
        ${campaignTransitionTypes}
      }
    }
  }
  ${campaignTopicFragments}
  ${campaignTopicTransitionFragments}
`;

const fetchTopicById = `
  query getTopicById($id: String!) {
    topic(id: $id) {
      id
      contentType
      ... on AskMultipleChoiceBroadcastTopic {
        invalidAskMultipleChoiceResponse
        saidFirstChoiceTransition {
          ${campaignTransitionTypes}
        }
        saidSecondChoiceTransition {
          ${campaignTransitionTypes}
        }
        saidThirdChoiceTransition {
          ${campaignTransitionTypes}
        }
        saidFourthChoiceTransition {
          ${campaignTransitionTypes}
        }
        saidFifthChoiceTransition {
          ${campaignTransitionTypes}
        }
      }
      ... on AskSubscriptionStatusBroadcastTopic {
        invalidAskSubscriptionStatusResponse
        saidNeedMoreInfo
        saidActiveTransition {
          text
          topic {
            id
          }
        }
        saidLessTransition {
          text
          topic {
            id
          }
        }
      }
      ... on AskVotingPlanStatusBroadcastTopic {
        saidCantVoteTransition {
          ${campaignTransitionTypes}
        }
        saidNotVotingTransition {
          ${campaignTransitionTypes}
        }
        saidVotedTransition {
          ${campaignTransitionTypes}
        }
      }
      ... on AskYesNoBroadcastTopic {
        invalidAskYesNoResponse
        saidNoTransition {
          ${campaignTransitionTypes}
        }
        saidYesTransition {
          ${campaignTransitionTypes}
        }
      }
      ... on AutoReplyTopic {
        ...autoReplyCampaign
        autoReply
      }
      ... on PhotoPostTopic {
        ...photoPostCampaign
        askCaption
        askPhoto
        askQuantity
        askWhyParticipated
        invalidCaption
        invalidPhoto
        invalidQuantity
        invalidWhyParticipated
        completedPhotoPost
        completedPhotoPostAutoReply
        startPhotoPostAutoReply
      }
      ... on TextPostTopic {
        ...textPostCampaign
        invalidText
        completedTextPost
      }
    }
  }
  ${campaignTopicFragments}
  ${campaignTopicTransitionFragments}
`;

const fetchWebSignupConfirmations = `
  query getWebSignupConfirmations {
    webSignupConfirmations {
      campaign {
        id
        endDate
      }
      topic {
        ${campaignTransitionTypes}
      }
    }
  }
  ${campaignTopicFragments}
  ${campaignTopicTransitionFragments}
`;

module.exports = {
  queries: {
    fetchBroadcastById,
    fetchConversationTriggers,
    fetchTopicById,
    fetchWebSignupConfirmations,
  },
  clientOptions: {
    baseURI: process.env.DS_GRAPHQL_API_BASEURI,
  },
};
