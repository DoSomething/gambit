'use strict';

const Promise = require('bluebird');

const helpers = require('../../helpers');

function getCampaignId(broadcastObject) {
  const campaign = broadcastObject.fields.campaign;
  return campaign.fields.campaignId;
}

function replaceFieldsInMessage(fields = [], message) {
  let msg = message;
  fields.forEach((field) => {
    const key = Object.keys(field)[0];
    msg = message.replace(new RegExp(`{{${key}}}`, 'g'), field[key]);
  });
  return msg;
}

function getMessage(broadcastObject) {
  return broadcastObject.fields.message;
}

function parsePropertiesFromBroadcast(req, res) {
  return helpers.getBroadcast(req, res)
    .then((broadcast) => {
      req.campaignId = getCampaignId(broadcast);
      req.importMessageText = replaceFieldsInMessage(req.messageFields, getMessage(broadcast));
      return broadcast;
    });
}

module.exports = function getBroadcast() {
  return (req, res, next) => {
    const asyncProperties = [];

    if (!req.broadcastId) {
      return next();
    }

    asyncProperties.push(parsePropertiesFromBroadcast(req, res));

    // Process async parsers
    return Promise.all(asyncProperties)
      .then(() => next())
      .catch(err => helpers.sendGenericErrorResponse(res, err));
  };
};
