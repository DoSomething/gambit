'use strict';

const logger = require('../../logger');

module.exports = function outboundStudioMessage() {
  return async (req, res) => {
    try {
      return res.send({ data: 'test' });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
