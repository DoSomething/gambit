'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const integrationHelper = require('../../../../helpers/integration');
const Message = require('../../../../../app/models/Message');
const stubs = require('../../../../helpers/stubs');
const subscriptionHelper = require('../../../../../config/lib/helpers/subscription');
const seederHelper = require('../../../../helpers/integration/seeder');

const should = chai.should();
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

/**
 * PATCH /api/v2/messages/:id
 */

test('PATCH /api/v2/messages/:id should return 401 if not using valid credentials', async (t) => {
  const res = await t.context.request.patch(integrationHelper.routes.v2.messages('12345'));
  res.status.should.be.equal(401);
});

test('PATCH /api/v2/messages/:id should update the message deliveredAt delivery metadata', async (t) => {
  // setup
  const { outboundMessage } = await seederHelper.seed.conversationMessages();
  const updateBody = stubs.twilio.getDeliveredMessageUpdate();

  // test
  const res = await t.context.request.patch(
    integrationHelper.routes.v2.messages(outboundMessage.id))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(updateBody);
  res.status.should.be.equal(204);

  const updatedMessage = await Message.findById(outboundMessage.id);
  should.exist(updatedMessage.metadata.delivery.deliveredAt);
});

test('PATCH /api/v2/messages/:id should update the message failedAt and failureData metadata', async (t) => {
  // setup
  const { outboundMessage } = await seederHelper.seed.conversationMessages();
  const updateBody = stubs.twilio.getFailedMessageUpdate(true);

  integrationHelper.routes.northstar.intercept.createOAuthToken();
  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), stubs.northstar.getUser());
  integrationHelper.routes.northstar
    .intercept.updateUserById(stubs.getUserId(), stubs.northstar.getUser({
      subscription: 'undeliverable',
    }));

  // test
  const res = await t.context.request.patch(
    integrationHelper.routes.v2.messages(outboundMessage.id))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(updateBody);

  // Error message here is "Cannot read property \'access_token\' of undefined".
  t.log(res.body);

  res.status.should.be.equal(204);

  // Let's confirm the message was indeed updated
  const updatedMessage = await Message.findById(outboundMessage.id);
  should.exist(updatedMessage.metadata.delivery.failedAt);
  should.exist(updatedMessage.metadata.delivery.failureData.code);
  should.exist(updatedMessage.metadata.delivery.failureData.message);
  updatedMessage.metadata.delivery.failureData.code.should.be.eql(
    updateBody.metadata.delivery.failureData.code);
  updatedMessage.metadata.delivery.failureData.message.should.be.eql(
    updateBody.metadata.delivery.failureData.message);
});
