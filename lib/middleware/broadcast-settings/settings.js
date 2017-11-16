'use strict';

const logger = require('../../logger');

const helpers = require('../../helpers');

module.exports = function getSettings() {
  return (req, res) => {
    logger.debug('Generating settings for Broadcast', { broadcastId: req.params.broadcastId }, req);
    let settings;
    try {
      settings = helpers.broadcast.getSettings(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
    return res.send(settings);
  };
};
