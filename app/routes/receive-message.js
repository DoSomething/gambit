'use strict';

const express = require('express');

const router = express.Router();

const paramsMiddleware = require('../../lib/middleware/receive-message/params');
const getConversationMiddleware = require('../../lib/middleware/conversation-get');
const createConversationMiddleware = require('../../lib/middleware/conversation-create');
const getUserMiddleware = require('../../lib/middleware/receive-message/user-get');
const createUserIfNotFoundMiddleware = require('../../lib/middleware/receive-message/user-create');
const loadInboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound-load');
const createInboundMessageMiddleware = require('../../lib/middleware/receive-message/message-inbound-create');
const badWordsMiddleware = require('../../lib/middleware/receive-message/bad-words');
const campaignKeywordMiddleware = require('../../lib/middleware/receive-message/campaign-keyword');
const getRivescriptReplyMiddleware = require('../../lib/middleware/receive-message/rivescript-reply-get');
const rivescriptTemplateMiddleware = require('../../lib/middleware/receive-message/template-rivescript');
const crisisTemplateMiddleware = require('../../lib/middleware/receive-message/template-crisis');
const infoTemplateMiddleware = require('../../lib/middleware/receive-message/template-info');
const updateUserMiddleware = require('../../lib/middleware/receive-message/user-update');
const supportRequestedMiddleware = require('../../lib/middleware/receive-message/support-requested');
const forwardSupportMessageMiddleware = require('../../lib/middleware/receive-message/support-message');
const campaignMenuMiddleware = require('../../lib/middleware/receive-message/campaign-menu');
const currentCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-current');
const closedCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-closed');
const noCampaignTemplateMiddleware = require('../../lib/middleware/receive-message/template-no-campaign');
const parseAskSignupMiddleware = require('../../lib/middleware/receive-message/parse-ask-signup-answer');
const parseAskContinueMiddleware = require('../../lib/middleware/receive-message/parse-ask-continue-answer');
const continueCampaignMiddleware = require('../../lib/middleware/receive-message/campaign-continue');

router.use(paramsMiddleware());

// Load/create conversation.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

// Fetch/create Northstar User.
router.use(getUserMiddleware());
router.use(createUserIfNotFoundMiddleware());

// Send inbound message text to Rivescript for a reply.
router.use(getRivescriptReplyMiddleware());

// Load/create inbound message.
router.use(loadInboundMessageMiddleware());
router.use(createInboundMessageMiddleware());

// Updates Last Messaged At, Subscription Status, Paused.
router.use(updateUserMiddleware());

// Scolds User if inbound message contains bad words.
router.use(badWordsMiddleware());

// Checks for INFO or HELP keywords.
router.use(infoTemplateMiddleware());

// If MENU keyword, set random Campaign and ask for Signup.
router.use(campaignMenuMiddleware());

// If Campaign keyword was sent, update Conversation campaign and send continueCampaign.
router.use(campaignKeywordMiddleware());

// Sends CTL info for any crisis triggers.
router.use(crisisTemplateMiddleware());

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
