'use strict';

const Promise = require('bluebird');

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

// TODO: Move inside lib/contentful
function getCampaignId(broadcastObject) {
  const campaign = broadcastObject.fields.campaign;
  if (!campaign.fields) {
    return null;
  }
  return campaign.fields.campaignId;
}

// TODO: Move inside lib/contentful
function getTopic(broadcastObject) {
  return broadcastObject.fields.topic;
}

// TODO: Move inside lib/contentful
function replaceFieldsInMessage(fields = [], message) {
  let msg = message;
  fields.forEach((field) => {
    const key = Object.keys(field)[0];
    msg = message.replace(new RegExp(`{{${key}}}`, 'g'), field[key]);
  });
  return msg;
}

// TODO: Move inside lib/contentful
function getMessage(broadcastObject) {
  return broadcastObject.fields.message;
}

// TODO: Move inside lib/contentful
function parsePropertiesFromBroadcast(req, res) {
  return helpers.getBroadcast(req, res)
    .then((broadcast) => {
      req.topic = getTopic(broadcast);
      req.campaignId = getCampaignId(broadcast);
      req.messageText = replaceFieldsInMessage(req.messageFields, getMessage(broadcast));
      return broadcast;
    });
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    const asyncProperties = [];

    // We are only allowing Customer.io imports, which MUST have broadcastId. If in the future
    // we want to allow generic imports we can relax this requirement here and call next()
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('broadcastId is a required property.');
      return helpers.sendErrorResponse(res, error);
    }

    asyncProperties.push(parsePropertiesFromBroadcast(req, res));

    // Process async parsers
    return Promise.all(asyncProperties)
      .then(() => next())
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
