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
const updateUserMiddleware = require('../../../lib/middleware/messages/member/user-update');
const supportRequestedMiddleware = require('../../../lib/middleware/messages/member/support-requested');
const forwardSupportMessageMiddleware = require('../../../lib/middleware/messages/member/support-message');
const changeTopicMacroMiddleware = require('../../../lib/middleware/messages/member/macro-change-topic');
const menuMacroMiddleware = require('../../../lib/middleware/messages/member/macro-menu');
const replyMacroMiddleware = require('../../../lib/middleware/messages/member/macro-reply');
const getTopicMiddleware = require('../../../lib/middleware/messages/member/topic-get');
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

// Updates Last Messaged At, Subscription Status, Paused.
router.use(updateUserMiddleware());

// Sends the Rivescript reply if it's not a macro.
router.use(parseRivescriptReplyMiddleware());

// Changes conversation topic if user sent a keyword.
router.use(changeTopicMacroMiddleware());

// Executes macros that send a single hardcoded reply.
router.use(replyMacroMiddleware());

// Responds to a menu command by finding a random campaign to ask user for signup.
router.use(menuMacroMiddleware());

// Scolds user if message contains bad words.
router.use(badWordsMiddleware());

// If Conversation is paused, forward inbound messages to Front, for agents to respond to.
// Sends an empty reply message back.
router.use(forwardSupportMessageMiddleware());

// Otherwise, fetch the current conversation topic.
router.use(getTopicMiddleware());

// Now that that the topic templates are loaded, check if this is a support request, as topics may
// override the supportRequested template.
// TODO: Move this into catchall.
router.use(supportRequestedMiddleware());

// Handles replies for askYesNo topics.
router.use(catchAllAskYesNoMiddleware());

// Checks whether to send an autoReply template.
router.use(catchAllAutoReplyMiddleware());

// Determines whether to start or continue conversation for the current topic.
router.use(catchAllDefaultMiddleware());

module.exports = router;
