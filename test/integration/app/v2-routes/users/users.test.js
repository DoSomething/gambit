'use strict';

/**
 * FIXME: Investigate why this line is required for test file to pass locally.
 * Without it Rogue client complaints of missing env variables.
 */
require('dotenv').config();

const test = require('ava');
const chai = require('chai');

const Conversation = require('../../../../../app/models/Conversation');
const conversationFactory = require('../../../../helpers/factories/conversation');
const integrationHelper = require('../../../../helpers/integration');
const Message = require('../../../../../app/models/Message');
const messageFactory = require('../../../../helpers/factories/message');

chai.should();
const expect = chai.expect;

test.before(async () => {
  await integrationHelper.hooks.db.connect();
});

test.beforeEach((t) => {
  integrationHelper.hooks.app(t.context);
});

test.afterEach(async () => {
  integrationHelper.hooks.interceptor.cleanAll();
  await integrationHelper.hooks.db.messages.removeAll();
  await integrationHelper.hooks.db.conversations.removeAll();
});

test.after.always(async () => {
  await integrationHelper.hooks.db.disconnect();
});

test('DELETE /api/v2/users/:id without an id should return a 404', async (t) => {
  const res = await t.context.request
    .delete(integrationHelper.routes.v2.users(false))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send();
  res.status.should.be.equal(404);
});

test('DELETE /api/v2/users/:id should anonymize a member\'s conversation and messages', async (t) => {
  const conversation = await conversationFactory.getValidConversation().save();
  const inboundMessage = await messageFactory.getValidMessage('inbound').save();

  const res = await t.context.request
    .delete(integrationHelper.routes.v2.users(conversation.userId))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send();

  const anonymizedConversation = await Conversation.findById(conversation._id);
  const anonymizedMessage = await Message.findById(inboundMessage._id);

  res.status.should.be.equal(200);
  expect(anonymizedConversation.platformUserId).to.be.null;
  expect(anonymizedMessage.text).to.be.null;
});
