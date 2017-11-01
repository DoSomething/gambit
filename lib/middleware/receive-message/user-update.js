'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

module.exports = function updateNorthstarUser() {
  return (req, res, next) => {
    // If we dont have a userId set, skip Northstar updates.
    if (!req.userId) {
      return next();
    }

    const replyText = req.rivescriptReplyText;
    const currentStatus = req.user.sms_status;
    const lessValue = helpers.subscriptionStatusLessValue();
    const stopValue = helpers.subscriptionStatusStopValue();
    let statusUpdate = null;

    if (helpers.isSubscriptionStatusStopMacro(replyText)) {
      statusUpdate = stopValue;
    } else if (helpers.isSubscriptionStatusLessMacro(replyText)) {
      statusUpdate = lessValue;
    // If User is set to undeliverable but we've now received a message from them OR we don't
    // have a status set at all:
    } else if (currentStatus === stopValue || !currentStatus) {
      // TODO: There's an edge case here, if a User sends STOP while they're paused.
      // We'll want to update the Conversation.paused to true by default if we're bringing someone
      // back to life.
      statusUpdate = helpers.subscriptionStatusActiveValue();
    }

    const data = {
      last_messaged_at: req.inboundMessage.createdAt,
      sms_paused: req.conversation.paused,
    };
    if (statusUpdate) {
      data.sms_status = statusUpdate;
    }

    return northstar.updateUser(req.userId, data)
      .then(() => {
        logger.debug('northstar.updateUser success', { userId: req.userId, data });

        if (statusUpdate === lessValue) {
          return helpers.subscriptionStatusLess(req, res);
        } else if (statusUpdate === stopValue) {
          return helpers.subscriptionStatusStop(req, res);
        }

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
