'use strict';

const campaignFields = `
  campaign {
    id
    endDate
  }
`;

const fetchTopicById = `
  query getTopicById($id: String!) {
    topic(id: $id) {
      id
      contentType
      ... on AskYesNoBroadcastTopic {
        invalidAskYesNoResponse
        saidNo
        saidNoTopic {
          id
        }
        saidYes
        saidYesTopic {
          id
          ...autoReplyCampaign
          ...photoPostCampaign
          ...textPostCampaign
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
  fragment autoReplyCampaign on AutoReplyTopic {
    ${campaignFields}
  }
  fragment photoPostCampaign on PhotoPostTopic {
    ${campaignFields}
  }
  fragment textPostCampaign on TextPostTopic {
    ${campaignFields}
  }
`;

module.exports = {
  queries: {
    fetchTopicById,
  },
  url: process.env.DS_GRAPHQL_API_BASEURI,
};
