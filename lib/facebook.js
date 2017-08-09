'use strict';

const FB = require('fb');
const logger = require('heroku-logger');

FB.setAccessToken(process.env.FB_PAGE_ACCESS_TOKEN);

/**
 * @param {string} recipientId
 * @param {string} messageText
 * @return {object}
 */
function formatPayload(recipientId, messageText) {
  const data = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };

  return data;
}

module.exports.postMessage = function (recipientId, messageText) {
  const data = formatPayload(recipientId, messageText);

  FB.api('me/messages', 'post', data, (res) => {
    if (!res || res.error) {
      // TODO console.log has to be replaced by other development logging library: Winston?
      // logger.error(! res ? 'error occurred' : res.error);
      return;
    }

    logger.debug('facebook.postMessage response', res.body);
  });
};
