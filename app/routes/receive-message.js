'use strict';

const express = require('express');
const bot = require('../../lib/rivescript');

const router = express.Router();
// Load Rivescript triggers and replies.
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/receive-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');
const loadInboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound-load');
const createInboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound-create');
const campaignKeywordMiddleware = require('../../lib/middleware/receive-message/campaign-keyword');
const rivescriptMiddleware = require('../../lib/middleware/receive-message/rivescript');
const pausedMiddleware = require('../../lib/middleware/receive-message/conversation-paused');
const campaignMenuMiddleware = require('../../lib/middleware/receive-message/campaign-menu');
const currentCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-current');
const closedCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-closed');
const parseAskSignupMiddleware = require('../../lib/middleware/receive-message/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../lib/middleware/receive-message/parse-ask-continue-answer');
const continueCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-continue');

router.use(paramsMiddleware());

// Load/create conversation
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

// Load/create inbound message.
router.use(loadInboundMessageMiddleware());
router.use(createInboundMessageMiddleware());

// If Campaign keyword, set keyword Campaign.
router.use(campaignKeywordMiddleware());

// Send our inbound message to Rivescript bot for a reply.
router.use(rivescriptMiddleware());

// If Conversation is paused, forward inbound messages elsewhere.
router.use(pausedMiddleware());

// If MENU command, set random Campaign and ask for Signup.
router.use(campaignMenuMiddleware());

// Otherwise, load the Campaign stored on the Conversation.
router.use(currentCampaignMiddleware());

// Make sure Campaign isn't closed.
router.use(closedCampaignMiddleware());

// Check for yes/no/invalid responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// Continue Campaign conversation, or prompt to return back to it.
router.use(continueCampaignMiddleware());

module.exports = router;
