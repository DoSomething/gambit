'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const slackMiddleware = require('../../lib/middleware/chatbot/receive-slack');
const apiMiddleware = require('../../lib/middleware/chatbot/receive-api');

const getUserMiddleware = require('../../lib/middleware/user-get-by-platform');
const createUserMiddleware = require('../../lib/middleware/user-create');

const inboundMessageMiddleware = require('../../lib/middleware/chatbot/message-inbound');
const outboundMessageMiddleware = require('../../lib/middleware/chatbot/message-outbound');

const getBotReplyMiddleware = require('../../lib/middleware/chatbot/reply-brain');
const brainTemplateMiddleware = require('../../lib/middleware/chatbot/template-brain');
const noReplyMiddleware = require('../../lib/middleware/chatbot/template-paused');
const campaignMenuMiddleware = require('../../lib/middleware/campaign-menu');
const campaignKeywordMiddleware = require('../../lib/middleware/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/campaign-current');
const parseAskSignupMiddleware = require('../../lib/middleware/chatbot/parse-ask-signup-response');
const parseAskContinueMiddleware = require('../../lib/middleware/chatbot/parse-ask-continue-response');
const askContinueMiddleware = require('../../lib/middleware/chatbot/template-ask-continue');
const setUserCampaignMiddleware = require('../../lib/middleware/user-set-campaign');
const gambitReplyMiddleware = require('../../lib/middleware/chatbot/template-gambit');
const campaignMessageMiddleware = require('../../lib/middleware/chatbot/template-campaign');
const setLastReplyTemplateMiddleware = require('../../lib/middleware/user-set-last-reply-template');

router.use(slackMiddleware());
router.use(apiMiddleware());

// Load user and create inbound message.
router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(inboundMessageMiddleware());

// Get bot response to user message.
router.use(getBotReplyMiddleware());

// Check for non-Campaign replies.
router.use(brainTemplateMiddleware());
router.use(noReplyMiddleware());

// Load appropriate Campaign.
router.use(campaignMenuMiddleware());
router.use(campaignKeywordMiddleware());
router.use(currentCampaignMiddleware());

// Parse user responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// If our last reply was non-Gambit, prompt to chat Gambit again.
router.use(askContinueMiddleware());

// Check if User Campaign has been updated.
router.use(setUserCampaignMiddleware());
router.use(gambitReplyMiddleware());
router.use(campaignMessageMiddleware());

// Update user and create outbound message.
router.use(setLastReplyTemplateMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
