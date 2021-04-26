'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/member/user-get');
const loadOutboundMessageConfig = require('../../../config/lib/middleware/messages/member/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/member/params');
const rateLimiterMiddleware = require('../../../lib/middleware/messages/member/rate-limiter');
const getConversationMiddleware = require('../../../lib/middleware/messages/conversation-get');
const createConversationMiddleware = require('../../../lib/middleware/messages/conversation-create');
const getUserMiddleware = require('../../../lib/middleware/messages/user-get');
const createUserIfNotFoundMiddleware = require('../../../lib/middleware/messages/member/user-create');
const loadInboundMessageMiddleware = require('../../../lib/middleware/messages/member/message-inbound-load');
const createInboundMessageMiddleware = require('../../../lib/middleware/messages/member/message-inbound-create');
const loadOutboundMessageMiddleware = require('../../../lib/middleware/messages/message-outbound-load');
const badWordsMiddleware = require('../../../lib/middleware/messages/member/bad-words');
const getRivescriptReplyMiddleware = require('../../../lib/middleware/messages/member/rivescript-reply-get');
const parseRivescriptReplyMiddleware = require('../../../lib/middleware/messages/member/rivescript-reply-parse');
const forwardSupportMessageMiddleware = require('../../../lib/middleware/messages/member/support-message');
const replyMacroMiddleware = require('../../../lib/middleware/messages/member/macro-reply');
const getTopicMiddleware = require('../../../lib/middleware/messages/member/topic-get');
const askMultipleChoiceMiddleware = require('../../../lib/middleware/messages/member/topics/ask-multiple-choice');
const askSubscriptionStatusMiddleware = require('../../../lib/middleware/messages/member/topics/ask-subscription-status');
const askVotingPlanStatusMiddleware = require('../../../lib/middleware/messages/member/topics/ask-voting-plan-status');
const askYesNoMiddleware = require('../../../lib/middleware/messages/member/topics/ask-yes-no');
const autoReplyMiddleware = require('../../../lib/middleware/messages/member/topics/auto-reply');
const validateCampaignMiddleware = require('../../../lib/middleware/messages/member/campaign-validate');
const createDraftPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/draft-create');
const draftQuantityPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/draft-quantity');
const draftPhotoPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/draft-photo');
const draftHoursSpentPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/draft-hours-spent');
const draftWhyParticipatedPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/draft-why-participated');
const createPhotoPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/photo/post-create');
const createTextPostMiddleware = require('../../../lib/middleware/messages/member/topics/posts/text/post-create');
const catchAllMiddleware = require('../../../lib/middleware/messages/member/catchall');

router.use(paramsMiddleware());

router.use(rateLimiterMiddleware());

// Get or create user for conversation.
router.use(getUserMiddleware(getUserConfig));
router.use(createUserIfNotFoundMiddleware());

// Load/create conversation.
router.use(getConversationMiddleware());
router.use(createConversationMiddleware());

// Get the Rivescript bot reply to the text sent from user.
router.use(getRivescriptReplyMiddleware());

// Checks if this is a retry request, and loads inbound message if it exists already.
router.use(loadInboundMessageMiddleware());

// Creates inbound message from user.
router.use(createInboundMessageMiddleware());

// Checks if this is a retry request, and loads outbound reply message if it exists already.
router.use(loadOutboundMessageMiddleware(loadOutboundMessageConfig));

// Sends the Rivescript reply if it's not a macro.
router.use(parseRivescriptReplyMiddleware());

// Executes macros that send a single hardcoded reply.
router.use(replyMacroMiddleware());

// Scolds user if message contains bad words.
router.use(badWordsMiddleware());

// If Conversation is paused, forward inbound messages to Front, for agents to respond to.
// Sends an empty reply message back.
router.use(forwardSupportMessageMiddleware());

// Otherwise, fetch the current conversation topic.
router.use(getTopicMiddleware());

// Handles replies for askMultipleChoice broadcast topics.
router.use(askMultipleChoiceMiddleware());

// Handles replies for askSubscriptionStatus broadcast topics.
router.use(askSubscriptionStatusMiddleware());

// Handles replies for askVotingPlanStatus broadcast topics.
router.use(askVotingPlanStatusMiddleware());

// Handles replies for askYesNo broadcast topics.
router.use(askYesNoMiddleware());

// Handles autoReply topics.
router.use(autoReplyMiddleware());

// If we've made it this far, this is a topic that collects posts for a campaign.
router.use(validateCampaignMiddleware());

// Handles text posts.
router.use(createTextPostMiddleware());

// Handles photo posts.
router.use(createDraftPhotoPostMiddleware());
router.use(draftQuantityPhotoPostMiddleware());
router.use(draftPhotoPhotoPostMiddleware());
router.use(draftHoursSpentPhotoPostMiddleware());
router.use(draftWhyParticipatedPhotoPostMiddleware());
router.use(createPhotoPostMiddleware());

// Sanity check for nothing this far matched.
router.use(catchAllMiddleware());

module.exports = router;
