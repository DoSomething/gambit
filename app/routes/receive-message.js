'use strict';

const express = require('express');
const bot = require('../../lib/rivescript');
const helpers = require('../../lib/helpers');

const router = express.Router();
bot.getBot();

const paramsMiddleware = require('../../lib/middleware/receive-message/params');
const getConvoMiddleware = require('../../lib/middleware/conversation-get');
const createConvoMiddleware = require('../../lib/middleware/conversation-create');

const inboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound');

const rivescriptReplyMiddleware = require('../../lib/middleware/receive-message/rivescript-reply');
const sendRivescriptReplyMiddleware = require('../../lib/middleware/receive-message/send-rivescript-reply');
const pausedMiddleware = require('../../lib/middleware/receive-message/conversation-paused');
const sendAskSignupMiddleware = require('../../lib/middleware/receive-message/send-ask-signup');
const campaignKeywordMiddleware = require('../../lib/middleware/receive-message/campaign-keyword');
const currentCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-current');
const parseAskSignupMiddleware = require('../../lib/middleware/receive-message/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../lib/middleware/receive-message/parse-ask-continue-answer');
const sendAskContinueMiddleware = require('../../lib/middleware/receive-message/send-ask-continue');
const setCampaignMiddleware = require('../../lib/middleware/receive-message/conversation-set-campaign');
const sendGambitCampaignsReplyMiddleware = require('../../lib/middleware/receive-message/send-gambit-campaigns-reply');
const sendCampaignMessageMiddleware = require('../../lib/middleware/receive-message/send-campaign-message');
const outboundMessageMiddleware = require('../../lib/middleware/receive-message/message-outbound');

router.use(paramsMiddleware());

// Load convo and create inbound message.
router.use(getConvoMiddleware());
router.use(createConvoMiddleware());
router.use(inboundMessageMiddleware());

// Send our inbound message to Rivescript bot for a reply.
router.use(rivescriptReplyMiddleware());

// Check for non-Campaign replies.
router.use(sendRivescriptReplyMiddleware());
router.use(pausedMiddleware());

// If MENU command, set random Campaign and ask for Signup.
router.use(sendAskSignupMiddleware());

// If Campaign keyword, set keyword Campaign.
router.use(campaignKeywordMiddleware());
router.use(currentCampaignMiddleware());

// Check for yes/no/invalid responses to sent Ask Signup/Continue messages:
router.use(parseAskSignupMiddleware());
router.use(parseAskContinueMiddleware());

// If our last outbound template was non-Gambit, prompt to continue back with the Campaign.
router.use(sendAskContinueMiddleware());

// Check if we need to update the Campaign.
router.use(setCampaignMiddleware());

// If this message is for a Campaign Signup, post to Gambit Campaigns and send the reply we get.
router.use(sendGambitCampaignsReplyMiddleware());

// Includes catchall for when no Campaign has been set, and no Rivescript reply matched.
router.use(sendCampaignMessageMiddleware());

// Create our outbound message and send the reply back to sender (if conversation isn't paused).
router.use(outboundMessageMiddleware());
router.post('/', (req, res) => helpers.sendResponse(req, res));

module.exports = router;
