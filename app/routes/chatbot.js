'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/params');
const getUserMiddleware = require('../../lib/middleware/user-get');
const createUserMiddleware = require('../../lib/middleware/user-create');
const updateUserMiddleware = require('../../lib/middleware/user-update');

const inboundMessageMiddleware = require('../../lib/middleware/user-inbound-message');
const outboundMessageMiddleware = require('../../lib/middleware/user-outbound-message');

const getBotReplyBrainMiddleware = require('../../lib/middleware/bot-reply-get');
const brainTemplateMiddleware = require('../../lib/middleware/template-brain');
const noReplyMiddleware = require('../../lib/middleware/template-noreply');
const campaignMenuTemplateMiddleware = require('../../lib/middleware/template-prompt-signup');
const getCampaignFromKeywordMiddleware = require('../../lib/middleware/campaign-keyword');
const getCampaignFromUserMiddleware = require('../../lib/middleware/campaign-current');
const declinedSignupMiddleware = require('../../lib/middleware/template-declined-signup');
const declinedContinueMiddleware = require('../../lib/middleware/template-declined-continue');
const promptCampaignContinueMiddleware = require('../../lib/middleware/template-prompt-continue');
const setUserCampaignMiddleware = require('../../lib/middleware/user-set-campaign');
const gambitReplyMiddleware = require('../../lib/middleware/template-gambit');
const defaultTemplateMiddleware = require('../../lib/middleware/template-default');

router.use(paramsMiddleware());

// Load user and create inbound message.
router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(inboundMessageMiddleware());

// Get bot response to user message.
router.use(getBotReplyBrainMiddleware());

// Parse response.
router.use(brainTemplateMiddleware());
router.use(noReplyMiddleware());

// Load Campaign.
router.use(campaignMenuTemplateMiddleware());
router.use(getCampaignFromKeywordMiddleware());
router.use(getCampaignFromUserMiddleware());

// Did User say no to joining/continuing the Campaign?
router.use(declinedSignupMiddleware());
router.use(declinedContinueMiddleware());

// If our last reply was non-Gambit, prompt to chat Gambit again.
router.use(promptCampaignContinueMiddleware());

// Check if User Campaign has been updated.
router.use(setUserCampaignMiddleware());
// Post User Message to Gambit chatbot to get the reply to send.
router.use(gambitReplyMiddleware());
router.use(defaultTemplateMiddleware());

// Update user and create outbound message.
router.use(updateUserMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
