'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/member/user-get');
const loadOutboundMessageConfig = require('../../../config/lib/middleware/messages/member/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/member/params');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const createUserIfNotFoundMiddleware = require('../../../lib/middleware/messages/member/user-create');
const loadInboundMessageMiddleware = require('../../../lib/middleware/messages/member/message-inbound-load');
const createInboundMessageMiddleware = require('../../../lib/middleware/messages/member/message-inbound-create');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const changeTopicMacroMiddleware = require('../../../lib/middleware/messages/member/macro-change-topic');
const macroReplyMiddleware = require('../../../lib/middleware/messages/member/template-macro-reply');
const badWordsMiddleware = require('../../../lib/middleware/messages/member/bad-words');
const campaignKeywordMiddleware = require('../../../lib/middleware/messages/member/campaign-keyword');
const getRivescriptReplyMiddleware = require('../../../lib/middleware/messages/member/rivescript-reply-get');
const rivescriptTemplateMiddleware = require('../../../lib/middleware/messages/member/template-rivescript');
const updateUserMiddleware = require('../../../lib/middleware/messages/member/user-update');
const supportRequestedMiddleware = require('../../../lib/middleware/messages/member/support-requested');
const forwardSupportMessageMiddleware = require('../../../lib/middleware/messages/member/support-message');
const campaignMenuMiddleware = require('../../../lib/middleware/messages/member/campaign-menu');
const getTopicMiddleware = require('../../../lib/middleware/messages/member/topic-get');
const closedCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-closed');
const noCampaignTemplateMiddleware = require('../../../lib/middleware/messages/member/template-no-campaign');
const parseAskSignupMiddleware = require('../../../lib/middleware/messages/member/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../../lib/middleware/messages/member/parse-ask-continue-answer');
const continueCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-continue');

router.use(paramsMiddleware());

// Get or create user for conversation.
router.use(getUserMiddleware(getUserConfig));
router.use(createUserIfNotFoundMiddleware());

// Load/create conversation.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

// Get the Rivescript bot reply to the text sent from user.
router.use(getRivescriptReplyMiddleware());

// Checks if this is a retry request, and loads inbound message if it exists already.
router.use(loadInboundMessageMiddleware());

// Creates inbound message from user.
router.use(createInboundMessageMiddleware());

// Checks if this is a retry request, and loads outbound reply message if it exists already.
router.use(loadOutboundMessageMiddleware(loadOutboundMessageConfig));

// Updates Last Messaged At, Subscription Status, Paused.
router.use(updateUserMiddleware());

// If bot reply is a changeTopic macro, execute it.
router.use(changeTopicMacroMiddleware());

// If bot reply is a macro with hardcoded reply message, send the reply.
router.use(macroReplyMiddleware());

// Scolds User if inbound message contains bad words.
router.use(badWordsMiddleware());

// If MENU keyword, set random Campaign and ask for Signup.
router.use(campaignMenuMiddleware());

// TODO: This won't be used once we publish defaultTopicTrigger entries with topic responses.
// If Campaign keyword was sent, update Conversation campaign and send continueCampaign.
router.use(campaignKeywordMiddleware());

// If Conversation is paused, forward inbound messages to Front, for agents to respond to.
// Sends an empty reply message back.
router.use(forwardSupportMessageMiddleware());

// Sends the reply text returned by Rivescript.
router.use(rivescriptTemplateMiddleware());

// Otherwise, fetch the current conversation topic.
router.use(getTopicMiddleware());

// If QUESTION keyword, pause Conversation and prompt User to send their support question.
router.use(supportRequestedMiddleware());

// Checks if a Campaign has been set.
router.use(noCampaignTemplateMiddleware());

// // Checks that Campaign isn't closed.
router.use(closedCampaignMiddleware());

// Check for yes/no/invalid responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// Continue Campaign conversation, or prompt to return back to it.
router.use(continueCampaignMiddleware());

module.exports = router;
