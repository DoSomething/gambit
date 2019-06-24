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
      .catch((rateLimiterRes) => {
        // Exposed as info for monitoring
        logger.info('member route Rate Limiter (Limit reached)', rateLimiterRes, req);
        // TODO: Create custom error and return correct headers
        // @see https://github.com/animir/node-rate-limiter-flexible#ratelimiterres-object
        return helpers.sendErrorResponseWithNoRetry(res, new Error('member route Rate Limiter Rejected'));
      });
  };
};
