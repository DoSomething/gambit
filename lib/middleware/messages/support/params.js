'use strict';

const helpers = require('../../../helpers');

module.exports = function params() {
  return (req, res, next) => {
    try {
      helpers.front.parseBody(req);
      helpers.request.setPlatform(req);
      helpers.request.setOutboundMessageTemplate(req, 'support');
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return next();
  };
};
