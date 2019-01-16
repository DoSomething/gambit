'use strict';

const graphql = require('graphql-request');

const GRAPHQL_URL = `${process.env.DS_GRAPHQL_API_BASEURI}/graphql`;

const campaignFields = `
  campaign {
    id
    endDate
  }
`;

/**
  * @param {String} id
  * @return {Promise}
  */
async function fetchTopicById(id) {
  const res = await graphql.request(GRAPHQL_URL, `
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
    `, { id });

  return res.topic;
}

module.exports = {
  fetchTopicById,
};
