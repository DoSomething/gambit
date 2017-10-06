'use strict';

const logger = require('heroku-logger');

const helpers = require('../../helpers');

module.exports = function getSettings() {
  return (req, res) => {
    logger.debug(`Generating settings for Broadcast: ${req.params.broadcastId}`);
    let settings;
    try {
      settings = helpers.broadcast.getSettings(req.broadcastObject, req.broadcastId);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
    return res.send(settings);
  };
};
