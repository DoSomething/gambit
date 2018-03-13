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
      const url = this.formatUrl(attachmentObject.url);
      req.attachments[direction].push({
        url,
        contentType: attachmentObject.contentType,
      });
    }
  },

  /**
   * @param   {string}
   * @return  {string}
   */
  formatUrl: function formatUrl(url) {
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    return url;
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
