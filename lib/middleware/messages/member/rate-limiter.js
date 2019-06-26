'use strict';

const config = require('../../../../config');
const logger = require('../../../logger');
const helpers = require('../../../helpers');

const { memberRoute: memberRouteRateLimiter } = require('../../../rate-limiters')
  .getRegistry(config.rateLimiters.memberRoute.test);

module.exports = function getMembersRateLimiter() {
  return async (req, res, next) => {
    const isTwilioRequest = helpers.request.isTwilio(req);
    // If not Twilio request skip rate limiter
    if (!isTwilioRequest) {
      logger.debug(`Not a twilio request ${req.platformUserId}`);
      return next();
    }
    return memberRouteRateLimiter.consume(req.platformUserId)
      .then((rateLimiterRes) => {
        logger.debug('member route Rate Limiter (Limit not reached)', rateLimiterRes, req);
        // keep processing request, limit not reached
        return next();
      })
      // TODO: Check rateLimiterRes is not an Error object.
      // Otherwise, response headers will not contain correct values.
      // @see https://github.com/animir/node-rate-limiter-flexible/wiki/API-methods#ratelimiterconsumekey-points--1
      .catch((rateLimiterRes) => {
        const loggedAttributes = {
          rateLimiterRes,
          rateLimitKey: req.platformUserId,
        };
        // Exposed as info for monitoring
        logger.info('member route Rate Limiter (Limit reached)', loggedAttributes, req);
        // Logged so we can actually search for the rate limited member
        helpers.analytics.addCustomAttributes(loggedAttributes);
        // @see https://github.com/animir/node-rate-limiter-flexible#ratelimiterres-object
        return helpers.errorNoticeable
          .sendRateLimitedResponse(res, rateLimiterRes);
      });
  };
};
