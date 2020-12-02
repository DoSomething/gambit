'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function inboundStudioMessage() {
  return async (req, res) => {
    try {
      await helpers.twilio.parseBody(req);

      logger.info('inbound', { From: req.platformUserId });

      // TODO: Create user if not found (catch 404 errors thrown here).
      /*
      const user = await helpers.user.fetchFromReq(req);

      helpers.request.setUser(req, user);
      */
      // For now, use platformUserId because the Flex Proxy masks our inbound From.
      req.userId = req.platformUserId;

      /**
       * TODO: Load user's current conversation topic.
       * We could potentially store in Redis instead of the DB.
       */

      const reply = await helpers.request.getRivescriptReply(req);

      // TODO: Render any tags in the reply text

      // TODO: If applicable, user subscription status or create signup / text post per reply.

      return res.send({
        data: {
          reply, 
        },
      });
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
