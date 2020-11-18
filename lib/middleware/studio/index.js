'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

module.exports = function inboundStudioMessage() {
  return async (req, res) => {
    try {
      await helpers.twilio.parseBody(req);

      // TODO: Create user if not found (look for 404 errors).
      const user = await helpers.user.fetchFromReq(req);

      helpers.request.setUser(req, user);

      const reply = await helpers.request.getRivescriptReply(req);

      // TODO: Update user subscription status per macro reply.

      return res.send({ data: { user, reply } });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
