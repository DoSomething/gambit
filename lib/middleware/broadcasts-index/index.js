'use strict';

const contentful = require('../../contentful');
const helpers = require('../../helpers');

function parseBroadcast(data) {
  const result = {
    id: data.sys.id,
    campaignId: contentful.getCampaignIdFromBroadcast(data),
    topic: contentful.getTopicFromBroadcast(data),
    message: contentful.getMessageTextFromBroadcast(data),
  };
  return result;
}

module.exports = function getBroadcasts() {
  return (req, res) => contentful.fetchBroadcasts()
    .then(contentfulRes => res.send(contentfulRes.map(entry => parseBroadcast(entry))))
    .catch(err => helpers.sendResponseWithError(res, err));
};
