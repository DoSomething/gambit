'use strict';

const express = require('express');

const router = express.Router();

const helpers = require('../../lib/helpers');

const paramsMiddleware = require('../../lib/middleware/import-message/params');
const getConvoMiddleware = require('../../lib/middleware/conversation-get');
const createConvoMiddleware = require('../../lib/middleware/conversation-create');
const parseContentfulPropertiesMiddleware = require('../../lib/middleware/import-message/contentful-properties-parse');
const updateConvoMiddleware = require('../../lib/middleware/import-message/conversation-update');
const outboundMessageMiddleware = require('../../lib/middleware/import-message/message-outbound');

router.use(paramsMiddleware());
router.use(parseContentfulPropertiesMiddleware());

// Load convo and create inbound message.
router.use(getConvoMiddleware());
router.use(createConvoMiddleware());

router.use(updateConvoMiddleware());
router.use(outboundMessageMiddleware());

router.post('/', (req, res) => helpers.sendResponseWithStatusCode(res));

module.exports = router;
