'use strict';

const express = require('express');
const bot = require('../../lib/bot');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/receive-message/params');
const getConvoMiddleware = require('../../lib/middleware/conversation-get');
const createConvoMiddleware = require('../../lib/middleware/conversation-create');

const inboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound');

const getBotReplyMiddleware = require('../../lib/middleware/receive-message/reply-brain');
const brainTemplateMiddleware = require('../../lib/middleware/receive-message/template-brain');
const pausedMiddleware = require('../../lib/middleware/receive-message/template-paused');
const campaignMenuMiddleware = require('../../lib/middleware/receive-message/campaign-menu');
const campaignKeywordMiddleware = require('../../lib/middleware/receive-message/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-current');
const parseAskSignupMiddleware = require('../../lib/middleware/receive-message/parse-ask-signup-response');
const parseAskContinueMiddleware = require('../../lib/middleware/receive-message/parse-ask-continue-response');
const askContinueMiddleware = require('../../lib/middleware/receive-message/template-ask-continue');
const setCampaignMiddleware = require('../../lib/middleware/receive-message/conversation-set-campaign');
const gambitReplyMiddleware = require('../../lib/middleware/receive-message/template-gambit');
const campaignMessageMiddleware = require('../../lib/middleware/receive-message/template-campaign');
const outboundMessageMiddleware = require('../../lib/middleware/receive-message/message-outbound');

router.use(paramsMiddleware());

// Load convo and create inbound message.
router.use(getConvoMiddleware());
router.use(createConvoMiddleware());
router.use(inboundMessageMiddleware());

// Get bot response to convo message.
router.use(getBotReplyMiddleware());

// Check for non-Campaign replies.
router.use(brainTemplateMiddleware());
router.use(pausedMiddleware());

// Load appropriate Campaign.
router.use(campaignMenuMiddleware());
router.use(campaignKeywordMiddleware());
router.use(currentCampaignMiddleware());

// Parse convo responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// If our last reply was non-Gambit, prompt to chat Gambit again.
router.use(askContinueMiddleware());

// Check if Convo Campaign has been updated.
router.use(setCampaignMiddleware());
router.use(gambitReplyMiddleware());
router.use(campaignMessageMiddleware());

router.use(outboundMessageMiddleware());
router.post('/', (req, res) => helpers.sendResponse(req, res));

module.exports = router;
