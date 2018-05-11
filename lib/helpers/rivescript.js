'use strict';

const contentful = require('../contentful');
const logger = require('../logger');

function fetchDefaultRivescriptTopicTriggers() {
  return new Promise((resolve, reject) => {
    // TODO: fetch all rivescriptTopic entries to add any additional topics
    contentful.fetchDefaultRivescriptTopicTriggers()
      .then((triggers) => {
        const result = triggers.map((trigger) => {
          const rivescriptTrigger = module.exports.parseDefaultRivescriptTopicTrigger(trigger);
          return rivescriptTrigger;
        });
        return resolve(result);
      })
      .catch(err => reject(err));
  });
}

function parseDefaultRivescriptTopicTriggerResponse(contentfulEntry) {
  if (contentful.isDefaultRivescriptTopicTrigger(contentfulEntry)) {
    const triggerText = contentful.getTriggerFromDefaultRivescriptTopicTrigger(contentfulEntry);
    return module.exports.formatTextAsRivescriptRedirect(triggerText);
  }

  if (contentful.isMessage(contentfulEntry)) {
    const messageText = contentful.getTextFromMessage(contentfulEntry);
    return module.exports.formatTextAsRivescriptReply(messageText);
  }

  throw new Error('Invalid content type for defaultRivescriptTopicTrigger.response');
}

function formatTextAsRivescriptRedirect(text) {
  return `@ ${text}`;
}

function formatTextAsRivescriptReply(text) {
  return `- ${text}`;
}

function formatTextAsRivescriptTrigger(text) {
  return `+ ${text}`.trim();
}

function formatRivescriptTrigger(triggerText, responseText) {
  logger.debug('formatRivescriptTrigger', { triggerText, responseText });
  const result = `${triggerText}\n${responseText}\n`;
  return result;
}

function parseDefaultRivescriptTopicTrigger(trigger) {
  const triggerText = contentful.getTriggerFromDefaultRivescriptTopicTrigger(trigger);
  const rsTrigger = module.exports.formatTextAsRivescriptTrigger(triggerText);
  const responseEntry = contentful.getResponseFromDefaultRivescriptTopicTrigger(trigger);
  const rsResponse = module.exports.parseDefaultRivescriptTopicTriggerResponse(responseEntry);
  return module.exports.formatRivescriptTrigger(rsTrigger, rsResponse);
}

module.exports = {
  formatRivescriptTrigger,
  formatTextAsRivescriptRedirect,
  formatTextAsRivescriptReply,
  formatTextAsRivescriptTrigger,
  fetchDefaultRivescriptTopicTriggers,
  parseDefaultRivescriptTopicTrigger,
  parseDefaultRivescriptTopicTriggerResponse,
};
