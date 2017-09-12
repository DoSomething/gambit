'use strict';

/**
 * Attachments helper
 */
module.exports = {

  /**
   * add - Adds attachments to its respective direction array.
   *
   * @param  {object} req
   * @param  {object} attachmentObject object containing url, and contentType
   * @param  {string} direction = 'inbound' direction array where to store this attachment
   */
  add: function add(req, attachmentObject, direction = 'inbound') {
    if (attachmentObject.url) {
      req.attachments[direction].push({
        url: attachmentObject.url,
        contentType: attachmentObject.contentType,
      });
    }
  },

  /**
   * parseFromReq - creates a generic attachment object from a req which contains a mediaUrl in the
   * body of the request.
   *
   * @param  {type} req description
   * @return {type}     description
   */
  parseFromReq: function parseFromReq(req) {
    return {
      url: req.body.mediaUrl,
    };
  },
};
