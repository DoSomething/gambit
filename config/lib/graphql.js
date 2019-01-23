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

const askYesNoBroadcastTopicFields = `
  ... on AskYesNoBroadcastTopic {
    invalidAskYesNoResponse
    saidNo
    saidNoTopic {
      id
    }
    saidYes
    saidYesTopic {
      id
      ...autoReplySignupCampaign
      ...photoPostCampaign
      ...textPostCampaign
    }
  }
`;

const campaignTopicFragments = `
  fragment autoReplySignupCampaign on AutoReplySignupTopic {
    ${campaignFields}
  }
  fragment photoPostCampaign on PhotoPostTopic {
    ${campaignFields}
  }
  fragment textPostCampaign on TextPostTopic {
    ${campaignFields}
  }
`;

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
      ${askYesNoBroadcastTopicFields}
      ... on AutoReplyBroadcast {
        topic {
          id
        }
      }
      ... on PhotoPostBroadcast {
        ${campaignTopicFields}
      }
      ... on TextPostBroadcast {
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
      ${askYesNoBroadcastTopicFields}
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

module.exports = {
  queries: {
    fetchBroadcastById,
    fetchConversationTriggers,
    fetchTopicById,
  },
  url: process.env.DS_GRAPHQL_API_BASEURI,
};
