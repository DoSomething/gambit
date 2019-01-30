'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');
const request = require('request-promise');
const moment = require('moment');

const attachmentsHelper = require('./attachments');
const requestHelper = require('./request');
const config = require('../../config/lib/helpers/twilio');


/**
 * parseBody - parses properties out of the body of a Twilio request
 *
 * @param  {object} req
 * @return {promise}
 */
function parseBody(req) {
  requestHelper.setPlatform(req);
  req.inboundMessageText = req.body.Body;
  req.platformMessageId = req.body.MessageSid;
  req.platformUserId = req.body.From;
  req.platformUserAddress = this.parseUserAddressFromReq(req);
  const attachmentObject = this.parseAttachmentFromReq(req);

  return new Promise((resolve, reject) => {
    if (attachmentObject.redirectUrl) {
      module.exports.getAttachmentUrl(attachmentObject.redirectUrl)
        .then((url) => {
          req.mediaUrl = url;
          attachmentObject.url = url;
          attachmentsHelper.add(req, attachmentObject, 'inbound');
          resolve(url);
        })
        .catch(error => reject(error));
    } else {
      resolve('attachmentObject doesn\'t contain a redirectUrl');
    }
  });
}

/**
 * parseAttachmentFromReq - parses the MediaUrl0 and MediaContentType0 out of Twilio requests
 * and creates an attachment object
 *
 * @param  {object} req
 * @return {object}
 */
function parseAttachmentFromReq(req) {
  return {
    redirectUrl: req.body.MediaUrl0,
    contentType: req.body.MediaContentType0,
  };
}

/**
 * getAttachmentUrl - It makes a GET request to the redirectUrl uri. It redirects the request
 * and returns the actual attachment's data. We are interested in storing the actual attachment's
 * address, which we get from the full response object of the request.
 *
 * @param  {string} redirectUrl
 * @return {promise}
 */
function getAttachmentUrl(redirectUrl) {
  const options = {
    uri: redirectUrl,
    // needed, otherwise returns the parsed body
    resolveWithFullResponse: true,
  };

  return request(options)
    .then((redirectRes) => {
      let url = '';
      try {
        url = redirectRes.request.uri.href;
      } catch (error) {
        // The data structure might have changed and code needs to be updated.
        logger.error('The Twilio attachment redirectUrl returns an error', error);
      }
      return url;
    });
}

/**
 * @param {object} req
 * @return {object}
 */
function parseUserAddressFromReq(req) {
  const body = req.body;
  // @see https://github.com/DoSomething/northstar/blob/dev/documentation/endpoints/users.md#create-a-user
  const data = {
    addr_city: body.FromCity,
    addr_state: body.FromState,
    addr_zip: body.FromZip,
    country: body.FromCountry,
    addr_source: req.platform,
  };

  return data;
}

/**
 * @param {object} error
 * @return {boolean}
 */
function isBadRequestError(error) {
  return error.status === 400;
}

/**
 * isUndeliverableError
 *
 * @param  {number} errorCode
 * @return {boolean}
 */
function isUndeliverableError(errorCode) {
  if (!errorCode) {
    return false;
  }
  const stringError = errorCode.toString();
  return Object.keys(config.undeliverableErrorCodes).includes(stringError);
}

/**
 * handleMessageCreationSuccess
 *
 * @param {Object} twilioResponse
 * @param {Message} message
 */
/* eslint-disable no-param-reassign */
function handleMessageCreationSuccess(twilioResponse, message) {
  const { sid, status } = twilioResponse;
  logger.debug('twilio.postMessage', { sid, status });

  // @see https://www.twilio.com/docs/api/messaging/message#resource-properties
  // We are mutating the message instance.
  message.platformMessageId = sid;
  message.metadata.delivery.queuedAt = twilioResponse.dateCreated;
  message.metadata.delivery.totalSegments = twilioResponse.numSegments;
  return message.save();
}

/**
 * handleMessageCreationFailure
 *
 * @param {Object} twilioError
 * @param {Message} message
 * @param {String} failedAt ISO8601 Date
 */
async function handleMessageCreationFailure(twilioError, message, failedAt) {
  // Is the status code 400? (Bad Request)
  if (module.exports.isBadRequestError(twilioError)) {
    // We are mutating the message instance.
    message.metadata.delivery.failedAt = failedAt || moment().format();
    message.metadata.delivery.failureData = {
      code: twilioError.code,
      message: twilioError.message,
    };
    await message.save();
  }
}
/* eslint-enable no-param-reassign */

/**
 * Twilio helper
 */
module.exports = {
  parseBody,
  parseAttachmentFromReq,
  getAttachmentUrl,
  parseUserAddressFromReq,
  isBadRequestError,
  isUndeliverableError,
  handleMessageCreationSuccess,
  handleMessageCreationFailure,
};
