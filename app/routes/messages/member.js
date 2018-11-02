'use strict';

const express = require('express');

const router = express.Router();

// Middleware configs
const getUserConfig = require('../../../config/lib/middleware/messages/member/user-get');
const loadOutboundMessageConfig = require('../../../config/lib/middleware/messages/member/message-outbound');

// Middleware
const paramsMiddleware = require('../../../lib/middleware/messages/member/params');
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
const catchAllAskVotingPlanStatusMiddleware = require('../../../lib/middleware/messages/member/catchAll-askVotingPlanStatus');
const catchAllAskYesNoMiddleware = require('../../../lib/middleware/messages/member/catchAll-askYesNo');
const catchAllAutoReplyMiddleware = require('../../../lib/middleware/messages/member/catchAll-autoReply');
const catchAllDefaultMiddleware = require('../../../lib/middleware/messages/member/catchAll');

router.use(paramsMiddleware());

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

// Parses non-macro Rivescript replies.
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

// Handles replies for askVotingPlanStatus topics.
router.use(catchAllAskVotingPlanStatusMiddleware());

// Handles replies for askYesNo topics.
router.use(catchAllAskYesNoMiddleware());

// Checks whether to send an autoReply template.
router.use(catchAllAutoReplyMiddleware());

// Determines whether to start or continue conversation for the current topic.
router.use(catchAllDefaultMiddleware());

module.exports = router;
