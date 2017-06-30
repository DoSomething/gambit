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
const michaelTopicMiddleware = require('../../lib/middleware/template-michael');
const campaignMenuTemplateMiddleware = require('../../lib/middleware/template-campaign-menu');
const getCampaignFromKeywordMiddleware = require('../../lib/middleware/campaign-keyword');
const getCampaignFromUserMiddleware = require('../../lib/middleware/campaign-current');
const gambitReplyMiddleware = require('../../lib/middleware/template-gambit');
const defaultTemplateMiddleware = require('../../lib/middleware/template-default');

router.use(paramsMiddleware());
// Load user.
router.use(getUserMiddleware());
router.use(createUserMiddleware());
router.use(inboundMessageMiddleware());
// Get bot response to user message.
router.use(getBotReplyBrainMiddleware());
// Parse response.
router.use(brainTemplateMiddleware());
router.use(noReplyMiddleware());
router.use(michaelTopicMiddleware());
router.use(campaignMenuTemplateMiddleware());
router.use(getCampaignFromKeywordMiddleware());
router.use(getCampaignFromUserMiddleware());
router.use(gambitReplyMiddleware());
// Render response.
router.use(defaultTemplateMiddleware());
router.use(updateUserMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendChatbotResponse(req, res));

module.exports = router;
