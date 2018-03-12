'use strict';

const frontClient = require('../front');

module.exports = {
  getConversationByUrl: function getConversationByUrl(url) {
    return frontClient.get(url);
  },
  isConversationArchived: function isConversationArchived(frontConversation) {
    return frontConversation.status === 'archived';
  },
};
