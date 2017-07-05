'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/params');
const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const setLastReplyTemplateMiddleware = require('../../lib/middleware/user-set-last-reply-template');

const inboundMessageMiddleware = require('../../lib/middleware/user-inbound-message');
const outboundMessageMiddleware = require('../../lib/middleware/user-outbound-message');

const getBotReplyMiddleware = require('../../lib/middleware/reply-brain');
const brainTemplateMiddleware = require('../../lib/middleware/template-brain');
const noReplyMiddleware = require('../../lib/middleware/template-paused');
const campaignMenuMiddleware = require('../../lib/middleware/campaign-menu');
const campaignKeywordMiddleware = require('../../lib/middleware/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/campaign-current');
const declinedSignupMiddleware = require('../../lib/middleware/template-declined-signup');
const declinedContinueMiddleware = require('../../lib/middleware/template-declined-continue');
const askContinueMiddleware = require('../../lib/middleware/template-ask-continue');
const setUserCampaignMiddleware = require('../../lib/middleware/user-set-campaign');
const gambitReplyMiddleware = require('../../lib/middleware/template-gambit');
const renderReplyTextMiddleware = require('../../lib/middleware/reply-render');

router.use(paramsMiddleware());

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

// Check for no responses to Ask Signup/Continue:
router.use(declinedSignupMiddleware());
router.use(declinedContinueMiddleware());

// If our last reply was non-Gambit, prompt to chat Gambit again.
router.use(askContinueMiddleware());

// Check if User Campaign has been updated.
router.use(setUserCampaignMiddleware());

// Post User Message to Gambit chatbot to get the reply to send back.
router.use(gambitReplyMiddleware());

// Set reply.text if hasn't been set yet.
router.use(renderReplyTextMiddleware());

// Update user and create outbound message.
router.use(setLastReplyTemplateMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
