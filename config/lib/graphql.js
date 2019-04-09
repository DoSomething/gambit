'use strict';

const campaignFields = `
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

const campaignTopicTypes = `
  ...autoReplySignupCampaign
  ...photoPostCampaign
  ...textPostCampaign
`;

const campaignTopicFragments = `
  fragment autoReplySignupCampaign on AutoReplySignupTopic {
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

const saidYesTopicFields = `
  saidYesTopic {
    id
    ${campaignTopicTypes}
  }
`;

const actionFields = `
  action {
    id
    name
    campaignId
    postType
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
        ${actionFields}
      }
      ... on AskYesNoBroadcastTopic {
        ${saidYesTopicFields}
        ${actionFields}
      }
      ... on AutoReplyBroadcast {
        topic {
          id
        }
      }
      ... on PhotoPostBroadcast {
        ${actionFields}
        ${campaignTopicFields}
      }
      ... on TextPostBroadcast {
        ${actionFields}
        ${campaignTopicFields}
      }
    }
  }
  ${campaignTopicFragments}
`;

const fetchConversationTriggers = `
  query getConversationTriggers {
    conversationTriggers {
      trigger
      reply
      topic {
        id
        ... on AutoReplySignupTopic {
          ${campaignFields}
        }
        ... on PhotoPostTopic {
          ${campaignFields}
        }
        ... on TextPostTopic {
          ${campaignFields}
        }
      }
    }
  }
`;

const fetchTopicById = `
  query getTopicById($id: String!) {
    topic(id: $id) {
      id
      contentType
      ... on AskMultipleChoiceBroadcastTopic {
        invalidAskMultipleChoiceResponse
        saidFirstChoice
        saidFirstChoiceTopic {
          id
          ${campaignTopicTypes}
        }
        saidSecondChoice
        saidSecondChoiceTopic {
          id
          ${campaignTopicTypes}
        }
        saidThirdChoice
        saidThirdChoiceTopic {
          id
          ${campaignTopicTypes}
        }
        saidFourthChoice
        saidFourthChoiceTopic {
          id
          ${campaignTopicTypes}
        }
        saidFifthChoice
        saidFifthChoiceTopic {
          id
          ${campaignTopicTypes}
        }
      }
      ... on AskSubscriptionStatusBroadcastTopic {
        invalidAskSubscriptionStatusResponse
        saidNeedMoreInfo
        saidActive
        saidActiveTopic {
          id
        }
        saidLess
        saidLessTopic {
          id
        }
      }
      ... on AskVotingPlanStatusBroadcastTopic {
        saidCantVote
        saidCantVoteTopic {
          id
        }
        saidNotVoting
        saidNotVotingTopic {
          id
        }
        saidVoted
        saidVotedTopic {
          id
        }
      }
      ... on AskYesNoBroadcastTopic {
        invalidAskYesNoResponse
        saidNo
        saidNoTopic {
          id
        }
        saidYes
        ${saidYesTopicFields}
      }
      ... on AutoReplySignupTopic {
        ...autoReplySignupCampaign
        autoReply
      }
      ... on AutoReplyTopic {
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
`;

const fetchWebSignupConfirmations = `
  query getWebSignupConfirmations {
    webSignupConfirmations {
      campaign {
        id
        endDate
      }
      text
      topic {
        id
      }
    }
  }
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
