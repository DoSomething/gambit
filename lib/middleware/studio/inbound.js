'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function inboundStudioMessage() {
  return async (req, res) => {
    try {
      await helpers.twilio.parseBody(req);

      logger.info('inbound', { From: req.platformUserId });

      // TODO: Create user if not found (catch 404 errors thrown here).
      const user = await helpers.user.fetchFromReq(req);

      helpers.request.setUser(req, user);

      const reply = await helpers.request.getRivescriptReply(req);

      // TODO: If applicable, user subscription status or create signup / text post per reply.

      return res.send({
        data: {
          user: { id: user.id },
          reply, 
        },
      });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
