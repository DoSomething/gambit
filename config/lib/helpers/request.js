'use strict';

module.exports = {
  // The parseAskYesNo function returns a Rivescript bot reply within an internal topic
  // used strictly for parsing, and DRY all synonyms for words like 'yes', 'no', 'stop', etc.
  // @see brain/topics
  askYesNo: {
    topicId: 'ask_yes_no',
    // These values should match the replies defined in the topic.
    values: {
      yes: 'yes',
      no: 'no',
      invalid: 'invalid',
    },
  },
};
