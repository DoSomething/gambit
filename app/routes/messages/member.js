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
const macroReplyMiddleware = require('../../../lib/middleware/messages/member/template-macro-reply');
const badWordsMiddleware = require('../../../lib/middleware/messages/member/bad-words');
const campaignKeywordMiddleware = require('../../../lib/middleware/messages/member/campaign-keyword');
const getRivescriptReplyMiddleware = require('../../../lib/middleware/messages/member/rivescript-reply-get');
const rivescriptTemplateMiddleware = require('../../../lib/middleware/messages/member/template-rivescript');
const updateUserMiddleware = require('../../../lib/middleware/messages/member/user-update');
const supportRequestedMiddleware = require('../../../lib/middleware/messages/member/support-requested');
const forwardSupportMessageMiddleware = require('../../../lib/middleware/messages/member/support-message');
const campaignMenuMiddleware = require('../../../lib/middleware/messages/member/campaign-menu');
const currentCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-current');
const closedCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-closed');
const noCampaignTemplateMiddleware = require('../../../lib/middleware/messages/member/template-no-campaign');
const parseAskSignupMiddleware = require('../../../lib/middleware/messages/member/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../../lib/middleware/messages/member/parse-ask-continue-answer');
const continueCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-continue');

router.use(paramsMiddleware());

// Fetch User for Conversation.
router.use(getUserMiddleware(getUserConfig));

// Creates User if doesn't exist.
router.use(createUserIfNotFoundMiddleware());

// Load/create conversation.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

// Send inbound message text to Rivescript for a reply.
router.use(getRivescriptReplyMiddleware());

// Load/create inbound message.
router.use(loadInboundMessageMiddleware());
router.use(createInboundMessageMiddleware());

// Load outbound message.
router.use(loadOutboundMessageMiddleware(loadOutboundMessageConfig));

// Updates Last Messaged At, Subscription Status, Paused.
router.use(updateUserMiddleware());

// Sends macro reply if exists.
router.use(macroReplyMiddleware());

// Scolds User if inbound message contains bad words.
router.use(badWordsMiddleware());

// If MENU keyword, set random Campaign and ask for Signup.
router.use(campaignMenuMiddleware());

// If Campaign keyword was sent, update Conversation campaign and send continueCampaign.
router.use(campaignKeywordMiddleware());

// If Conversation is paused, forward inbound messages to Front, for agents to respond to.
// Sends an empty reply message back.
router.use(forwardSupportMessageMiddleware());

// Sends the reply text returned by Rivescript.
router.use(rivescriptTemplateMiddleware());

// Otherwise, load the Campaign stored on the Conversation.
router.use(currentCampaignMiddleware());

// If QUESTION keyword, pause Conversation and prompt User to send their support question.
router.use(supportRequestedMiddleware());

// Checks if a Campaign has been set.
router.use(noCampaignTemplateMiddleware());

// Checks that Campaign isn't closed.
router.use(closedCampaignMiddleware());

// Check for yes/no/invalid responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// Continue Campaign conversation, or prompt to return back to it.
router.use(continueCampaignMiddleware());

module.exports = router;
