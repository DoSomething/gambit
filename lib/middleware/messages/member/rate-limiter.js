'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const { memberRoute: memberRouteRateLimiter } = require('../../../rate-limiters').getRegistry();

module.exports = function getMembersRateLimiter() {
  return async (req, res, next) => {
    const isTwilioRequest = helpers.request.isTwilio(req);
    // If not Twilio request skip rate limiter
    if (!isTwilioRequest) {
      logger.debug(`Not a twilio request ${req.platformUserId}`);
      return next();
    }
    return memberRouteRateLimiter.consume(req.platformUserId)
      .then((RateLimiterRes) => {
        logger.debug('MemberRoute Rate Limiter (Limit not reached)', RateLimiterRes, req);
        // keep processing request, limit not reached
        return next();
      })
      .catch((rateLimiterRes) => {
        // Exposed as info for monitoring
        logger.info('MemberRoute Rate Limiter (Limit reached)', rateLimiterRes, req);
        // TODO: Create custom error and return correct headers
        // @see https://github.com/animir/node-rate-limiter-flexible#ratelimiterres-object
        return helpers.sendErrorResponseWithNoRetry(res, new Error('Rate Limiter Rejected'));
      });
  };
};
