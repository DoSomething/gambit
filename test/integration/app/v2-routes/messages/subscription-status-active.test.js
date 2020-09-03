'use strict';

/**
 * FIXME: Investigate why this line is required for test file to pass locally.
 * Without it Rogue client complaints of missing env variables.
 */
require('dotenv').config();

const test = require('ava');
const chai = require('chai');

const tagsHelper = require('../../../../../lib/helpers/tags');
const repliesHelper = require('../../../../../lib/helpers/replies');
const integrationHelper = require('../../../../helpers/integration');
const Message = require('../../../../../app/models/Message');
const Conversation = require('../../../../../app/models/Conversation');
const stubs = require('../../../../helpers/stubs');
const seederHelper = require('../../../../helpers/integration/seeder');

const origin = 'subscriptionStatusActive';


const should = chai.should();

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

/**
 * PATCH /api/v2/messages/:id
 */

test('POST /api/v2/messages?origin=subscriptionStatusActive should return 401 if not using valid credentials', async (t) => {
  const res = await t.context.request.post(integrationHelper.routes.v2.messages(null, { origin }));
  res.status.should.be.equal(401);
});

test('POST /api/v2/messages?origin=subscriptionStatusActive without a northstarId should return an error', async (t) => {
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: null });
  res.status.should.be.equal(422);
});

test.serial('POST /api/v2/messages?origin=subscriptionStatusActive should create conversation as well as an outbound welcome message for a new user', async (t) => {
  const user = stubs.northstar.getUser({
    validUsNumber: true,
  });
  const subscriptionStatusActiveData = repliesHelper.templates.subscriptionStatusActive();

  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), user);

  // test
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: stubs.getUserId() });

  res.status.should.be.equal(200);

  // Let's confirm the conversation and message were indeed created
  const conversation = await Conversation.findOne({ userId: user.data.id });
  should.exist(conversation);
  const outboundMessage = await Message.findOne({ conversationId: conversation.id });
  should.exist(outboundMessage);
  outboundMessage.template.should.be.equal(subscriptionStatusActiveData.name);
  const renderedText = await tagsHelper
    .render(subscriptionStatusActiveData.text, { user: user.data });
  outboundMessage.text.should.be.equal(renderedText);
});

test.serial('POST /api/v2/messages?origin=subscriptionStatusActive should not create a new conversation if the user has one already', async (t) => {
  await seederHelper.seed.conversations(1);

  const user = stubs.northstar.getUser({
    validUsNumber: true,
  });
  const subscriptionStatusActiveData = repliesHelper.templates.subscriptionStatusActive();

  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), user);

  // test
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: stubs.getUserId() });

  res.status.should.be.equal(200);

  // We should have reused the conversation in the DB since it shares the same userId
  const conversationsFound = await Conversation.find({ userId: user.data.id });
  conversationsFound.length.should.be.equal(1);
  const conversation = conversationsFound[0];
  const messages = await Message.find({ conversationId: conversation.id });
  messages.length.should.be.equal(1);
  const message = messages[0];
  message.template.should.be.equal(subscriptionStatusActiveData.name);
  const renderedText = await tagsHelper
    .render(subscriptionStatusActiveData.text, { user: user.data });
  message.text.should.be.equal(renderedText);
});

test.serial('POST /api/v2/messages?origin=subscriptionStatusActive should not create conversation if the user has no mobile', async (t) => {
  const user = stubs.northstar.getUser({
    noMobile: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), user);

  // test
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: stubs.getUserId() });

  res.status.should.be.equal(422);

  // Let's confirm the conversation and message were indeed created
  const conversation = await Conversation.findOne({ userId: user.data.id });
  should.not.exist(conversation);
});

test.serial('POST /api/v2/messages?origin=subscriptionStatusActive should not create conversation if the user in unsubscribed', async (t) => {
  const user = stubs.northstar.getUser({
    subscription: 'undeliverable',
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), user);

  // test
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: stubs.getUserId() });

  res.status.should.be.equal(422);

  // Let's confirm the conversation and message were indeed created
  const conversation = await Conversation.findOne({ userId: user.data.id });
  should.not.exist(conversation);
});
