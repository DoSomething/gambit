'use strict';

const front = require('../../../front');
const helpers = require('../../../helpers');

module.exports = function params() {
  return (req, res, next) => {
    if (!front.isValidRequest(req)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }
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
