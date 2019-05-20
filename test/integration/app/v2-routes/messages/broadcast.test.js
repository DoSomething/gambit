'use strict';

const test = require('ava');
const chai = require('chai');

const integrationHelper = require('../../../../helpers/integration');
const stubs = require('../../../../helpers/stubs');

/**
 * We are using Twilio Test credentials in Wercker.
 * When this runs on wercker we are indeed making a call to the Twilio API.
 * But we do it with the Test credentials so its free and we are not actually
 * sending the text.
 */

chai.should();

test.before(async () => {
  await integrationHelper.hooks.db.connect();
});

test.beforeEach((t) => {
  integrationHelper.hooks.cache.broadcasts.set(
    stubs.getBroadcastId(),
    stubs.graphql.getBroadcastSingleResponse().data.broadcast,
  );
  integrationHelper.hooks.app(t.context);
});

test.afterEach(async () => {
  integrationHelper.hooks.interceptor.cleanAll();
  integrationHelper.hooks.cache.broadcasts.set(stubs.getBroadcastId(), null);
  await integrationHelper.hooks.db.messages.removeAll();
  await integrationHelper.hooks.db.conversations.removeAll();
});

test.after.always(async () => {
  await integrationHelper.hooks.db.disconnect();
});

test('POST /api/v2/messages?origin=broadcast should return 422 if userId is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();
  cioWebhookPayload.userId = null;
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(422);
  /**
   * TODO: checking against a hard coded string is brittle.
   * Will break w/ updating the error sent to user. Let's update when we cross that bridge.
   */
  res.body.message.should.include('Missing required userId');
});

test('POST /api/v2/messages?origin=broadcast should return 422 if broadcastId is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();
  cioWebhookPayload.broadcastId = null;
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);
  res.status.should.be.equal(422);
  res.body.message.should.include('Missing required broadcastId');
});

test('POST /api/v2/messages?origin=broadcast should return 404 if user is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, {}, 1, 404);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(404);
  res.body.message.should.include('Northstar user not found');
});

test('POST /api/v2/messages?origin=broadcast should return 422 if user is unsubscribed', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();

  const reply = stubs.northstar.getUser({
    noMobile: true,
    subscription: 'stop',
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(422);
  res.body.message.should.include('Northstar User is unsubscribed');
});

test('POST /api/v2/messages?origin=broadcast should return 200 if broadcast is sent successfully', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();

  const reply = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
});

test('POST /api/v2/messages?origin=broadcast should save campaign id in outbound metadata for text post broadcasts', async (t) => {
  const textPostBroadcast = stubs.graphql.getBroadcastSingleResponse('textPostBroadcast').data.broadcast;

  integrationHelper.hooks.cache.broadcasts.set(
    textPostBroadcast.id,
    textPostBroadcast,
  );
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload(textPostBroadcast.id);

  const reply = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
  res.body.data.messages[0].metadata.campaignId.should.equal(textPostBroadcast.action.campaignId);

  // clear cache
  integrationHelper.hooks.cache.broadcasts.set(textPostBroadcast.id, null);
});

test('POST /api/v2/messages?origin=broadcast should save campaign id in outbound metadata for photo post broadcasts', async (t) => {
  const photoPostBroadcast = stubs.graphql.getBroadcastSingleResponse('photoPostBroadcast').data.broadcast;

  integrationHelper.hooks.cache.broadcasts.set(
    photoPostBroadcast.id,
    photoPostBroadcast,
  );
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload(photoPostBroadcast.id);

  const reply = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
  res.body.data.messages[0].metadata.campaignId.should.equal(photoPostBroadcast.action.campaignId);

  // clear cache
  integrationHelper.hooks.cache.broadcasts.set(photoPostBroadcast.id, null);
});

test('POST /api/v2/messages?origin=broadcast should save campaign id in outbound metadata for ask yes no broadcasts', async (t) => {
  const askYesNoBroadcast = stubs.graphql.getBroadcastSingleResponse('askYesNo').data.broadcast;

  integrationHelper.hooks.cache.broadcasts.set(
    askYesNoBroadcast.id,
    askYesNoBroadcast,
  );
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload(askYesNoBroadcast.id);

  const reply = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
  res.body.data.messages[0].metadata.campaignId.should.equal(askYesNoBroadcast.action.campaignId);

  // clear cache
  // TODO: DRY
  integrationHelper.hooks.cache.broadcasts.set(askYesNoBroadcast.id, null);
});

test('POST /api/v2/messages?origin=broadcast should save broadcast id in outbound data for ask yes no broadcasts', async (t) => {
  const askYesNoBroadcast = stubs.graphql.getBroadcastSingleResponse('askYesNo').data.broadcast;

  integrationHelper.hooks.cache.broadcasts.set(
    askYesNoBroadcast.id,
    askYesNoBroadcast,
  );
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload(askYesNoBroadcast.id);
  const reply = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.northstar
    .intercept.fetchUserById(cioWebhookPayload.userId, reply, 1);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcast',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
  res.body.data.messages[0].broadcastId.should.equal(cioWebhookPayload.broadcastId);

  // clear cache
  // TODO: DRY
  integrationHelper.hooks.cache.broadcasts.set(cioWebhookPayload.broadcastId, null);
});

test('POST /api/v2/messages?origin=twilio outbound message should match sendInfoMessage if user texts INFO', async (t) => {
  const message = {
    getSmsMessageSid: stubs.twilio.getSmsMessageSid(),
    From: stubs.getMobileNumber('valid'),
    Body: "info",
  };

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(message);
  res.status.should.be.equal(200);
  res.body.data.messages.outbound[0].text.should.equal('These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or https://dosome.click/zt6mc. Txt STOP to quit. Msg&Data Rates May Apply.');
  res.body.data.messages.inbound[0].topic.should.equal(res.body.data.messages.outbound[0].topic);
});

test('POST /api/v2/messages?origin=twilio outbound message should match sendInfoMessage if user texts HELP', async (t) => {
  const message = {
    getSmsMessageSid: stubs.twilio.getSmsMessageSid(),
    From: stubs.getMobileNumber('valid'),
    Body: "help",
  };

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(message);

  res.status.should.be.equal(200);
  res.body.data.messages.outbound[0].text.should.equal('These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or https://dosome.click/zt6mc. Txt STOP to quit. Msg&Data Rates May Apply.');
  res.body.data.messages.inbound[0].topic.should.equal(res.body.data.messages.outbound[0].topic);
});
