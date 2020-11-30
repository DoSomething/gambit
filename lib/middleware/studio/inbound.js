'use strict';

const helpers = require('../../helpers');

module.exports = function inboundStudioMessage() {
  return async (req, res) => {
    try {
      await helpers.twilio.parseBody(req);

      // TODO: Create user if not found (look for 404 errors).
      const user = await helpers.user.fetchFromReq(req);

      helpers.request.setUser(req, user);

      const reply = await helpers.request.getRivescriptReply(req);

      // TODO: Update user subscription status or create signup per macro reply.

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
