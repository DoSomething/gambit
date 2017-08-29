'use strict';

const express = require('express');
const bot = require('../../lib/rivescript');
const helpers = require('../../lib/helpers');

const router = express.Router();
// Load Rivescript triggers and replies.
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/receive-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');
const inboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound');
const rivescriptMiddleware = require('../../lib/middleware/receive-message/rivescript');
const pausedMiddleware = require('../../lib/middleware/receive-message/conversation-paused');
const campaignMenuMiddleware = require('../../lib/middleware/receive-message/campaign-menu');
const campaignKeywordMiddleware = require('../../lib/middleware/receive-message/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-current');
const closedCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-closed');
const parseAskSignupMiddleware = require('../../lib/middleware/receive-message/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../lib/middleware/receive-message/parse-ask-continue-answer');
const continueCampaignMiddelware = require('../../lib/middleware/receive-message/campaign-continue');

router.use(paramsMiddleware());

// Load conversation and create inbound message.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());
router.use(inboundMessageMiddleware());

// Send our inbound message to Rivescript bot for a reply.
router.use(rivescriptMiddleware());

// If Conversation is paused, forward inbound messages elsewhere.
router.use(pausedMiddleware());

// If MENU command, set random Campaign and ask for Signup.
router.use(campaignMenuMiddleware());

// If Campaign keyword, set keyword Campaign.
router.use(campaignKeywordMiddleware());

// Otherwise, load the Campaign stored on the Conversation.
router.use(currentCampaignMiddleware());

// Make sure Campaign isn't closed.
router.use(closedCampaignMiddleware());

// Check for yes/no/invalid responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// If our last outbound template was not for the Campaign, prompt to continue Campaign Completion.
router.use(continueCampaignMiddelware());

// If we haven't matched anything yet, send this message to Gambit Campaigns for a reply.
router.post('/', (req, res) => helpers.sendReplyForCampaignSignupMessage(req, res));

module.exports = router;
