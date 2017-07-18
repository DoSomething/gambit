'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const slackMiddleware = require('../../lib/middleware/receive-slack');
const apiMiddleware = require('../../lib/middleware/receive-api');

const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');

const inboundMessageMiddleware = require('../../lib/middleware/user-inbound-message');
const outboundMessageMiddleware = require('../../lib/middleware/user-outbound-message');

const getBotReplyMiddleware = require('../../lib/middleware/reply-brain');
const brainTemplateMiddleware = require('../../lib/middleware/template-brain');
const noReplyMiddleware = require('../../lib/middleware/template-paused');
const campaignMenuMiddleware = require('../../lib/middleware/campaign-menu');
const campaignKeywordMiddleware = require('../../lib/middleware/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/campaign-current');
const parseAskSignupMiddleware = require('../../lib/middleware/parse-ask-signup-response');
const parseAskContinueMiddleware = require('../../lib/middleware/parse-ask-continue-response');
const askContinueMiddleware = require('../../lib/middleware/template-ask-continue');
const setUserCampaignMiddleware = require('../../lib/middleware/user-set-campaign');
const gambitReplyMiddleware = require('../../lib/middleware/template-gambit');
const campaignMessageMiddleware = require('../../lib/middleware/template-campaign');
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
