'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');
const request = require('request-promise');

const attachmentsHelper = require('./attachments');
const requestHelper = require('./request');

/**
 * Twilio helper
 */
module.exports = {

  /**
   * parseBody - parses properties out of the body of a Twilio request
   *
   * @param  {object} req
   * @return {promise}
   */
  parseBody: function parseBody(req) {
    requestHelper.setPlatformToSms(req);
    req.inboundMessageText = req.body.Body;
    req.platformMessageId = req.body.MessageSid;
    req.userMobile = req.body.From;
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
  },

  /**
   * parseAttachmentFromReq - parses the MediaUrl0 and MediaContentType0 out of Twilio requests
   * and creates an attachent object
   *
   * @param  {object} req
   * @return {object}
   */
  parseAttachmentFromReq: function parseAttachmentFromReq(req) {
    return {
      redirectUrl: req.body.MediaUrl0,
      contentType: req.body.MediaContentType0,
    };
  },

  /**
   * getAttachmentUrl - It makes a GET request to the redirectUrl uri. It redirects the request
   * and returns the actual attachment's data. We are interested in storing the actual attachment's
   * address, which we get from the full response object of the request.
   *
   * @param  {string} redirectUrl
   * @return {promise}
   */
  getAttachmentUrl: function getAttachmentUrl(redirectUrl) {
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
  },

  /**
   * @param {object} req
   * @return {object}
   */
  parseUserAddressFromReq: function parseUserAddressFromReq(req) {
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
  },

  /**
   * @param {object} error
   * @return {boolean}
   */
  isBadRequestError: function isBadRequestError(error) {
    return error.status === 400;
  },
};
