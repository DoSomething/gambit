'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const integrationHelper = require('../../../helpers/integration');
const Message = require('../../../../app/models/Message');
const stubs = require('../../../helpers/stubs');
const subscriptionHelper = require('../../../../config/lib/helpers/subscription');
const seederHelper = require('../../../helpers/integration/seeder');

const should = chai.should();
const expect = chai.expect;

test.before(async () => {
  await integrationHelper.hooks.db.connect();
});

test.beforeEach((t) => {
  integrationHelper.hooks.app(t.context);
});

test.afterEach(async () => {
  await integrationHelper.hooks.db.messages.removeAll();
  await integrationHelper.hooks.db.conversations.removeAll();
  nock.cleanAll();
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
  const { outboundMessage } = await seederHelper.seed.generalConvoInteraction();
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
  const { outboundMessage } = await seederHelper.seed.generalConvoInteraction();
  const updateBody = stubs.twilio.getFailedMessageUpdate(true);

  // intercept request to get Northstar user by mobile
  // TODO: Use the Node.js url module to set in houtes helper instead.
  nock(integrationHelper.routes.northstar.baseURI)
    .get(`/users/mobile/${stubs.getMobileNumber()}`)
    .reply(200, stubs.northstar.getUser());

  // intercept request to update Northstar user with new undeliverable sms_status
  nock(integrationHelper.routes.northstar.baseURI)
    .put(`/users/_id/${stubs.getUserId()}`)
    .reply((uri, body) => {
      const parsedBody = JSON.parse(body);

      // Assert that the payload includes the undeliverable sms_status
      expect(parsedBody.sms_status)
        .to.be.eql(subscriptionHelper.subscriptionStatuses.undeliverable);
      return [
        200,
        stubs.northstar.getUserWithUndeliverableSmsStatus(),
      ];
    });

  // test
  const res = await t.context.request.patch(
    integrationHelper.routes.v2.messages(outboundMessage.id))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(updateBody);

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
