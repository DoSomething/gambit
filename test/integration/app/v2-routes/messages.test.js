'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const integrationHelper = require('../../../helpers/integration');
const stubs = require('../../../helpers/stubs');

chai.should();

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
 * GET /
 */
test('GET /api/v2/messages should return 401 if not using valid credentials', async (t) => {
  const res = await t.context.request.get(integrationHelper.routes.v2.messages());
  res.status.should.be.equal(401);
});

test('GET /api/v2/messages should return 404', async (t) => {
  const res = await t.context.request.get(integrationHelper.routes.v2.messages())
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`);
  res.status.should.be.equal(404);
});

test('POST /api/v2/messages?origin=broadcastLite should return 422 if userId is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();
  cioWebhookPayload.userId = null;
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcastLite',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);
  res.status.should.be.equal(422);
});

test('POST /api/v2/messages?origin=broadcastLite should return 422 if broadcastId is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();
  cioWebhookPayload.broadcastId = null;
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcastLite',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);
  res.status.should.be.equal(422);
});

test('POST /api/v2/messages?origin=broadcastLite should return 422 if mobile is not found', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();
  cioWebhookPayload.mobile = null;
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcastLite',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);
  res.status.should.be.equal(422);
});

test('POST /api/v2/messages?origin=broadcastLite should return 422 if mobile is not valid', async (t) => {
  const validMobileNumber = false;
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload(validMobileNumber);

  nock(integrationHelper.routes.gambitCampaigns.baseURI)
    .get(`/broadcasts/${stubs.getBroadcastId()}`)
    .reply(200, stubs.gambitCampaigns.getBroadcastSingleResponse());

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcastLite',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(422);
});

test('POST /api/v2/messages?origin=broadcastLite should return 200 if broadcast is sent successfully', async (t) => {
  const cioWebhookPayload = stubs.broadcast.getCioWebhookPayload();

  nock(integrationHelper.routes.gambitCampaigns.baseURI)
    .get(`/broadcasts/${stubs.getBroadcastId()}`)
    .reply(200, stubs.gambitCampaigns.getBroadcastSingleResponse());

  /**
   * We are using Twilio Test credentials in Wercker.
   * When this runs on wercker we are indeed making a call to the Twilio API.
   * But we do it with the Test credentials so its free and we are not actually
   * sending the text.
   */
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'broadcastLite',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(cioWebhookPayload);

  res.status.should.be.equal(200);
  res.body.data.messages.length.should.be.equal(1);
});
