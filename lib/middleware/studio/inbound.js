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

      /**
       * TODO: Load user's current conversation topic.
       * We could potentially store in Redis instead of the DB.
       */

      const reply = await helpers.request.getRivescriptReply(req);

      const macro = helpers.macro.getMacro(reply.text);

      if (macro) {
        reply.text = macro.text ? macro.text : `Sorry, I didn't get that. Text Q if you have a question.`;
      }

      reply.macro = macro ? macro.name : null;

      // TODO: Render any tags in the reply text

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
