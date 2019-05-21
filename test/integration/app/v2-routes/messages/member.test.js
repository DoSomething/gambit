'use strict';

const test = require('ava');
const chai = require('chai');
const inspect = require('util').inspect;

const integrationHelper = require('../../../../helpers/integration');
const stubs = require('../../../../helpers/stubs');
const metadataParserConfig = require('../../../../../config/lib/middleware/metadata-parse');

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

test.serial('POST /api/v2/messages?origin=twilio should not re-send message to Twilio on retry', async (t) => {
  const member = stubs.northstar.getUser({ validUsNumber: true });
  const inboundRequestPayload = stubs.twilio.getInboundRequestBody(member);
  const requestId = stubs.getRequestId();

  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchConversationTriggers(), 2);

  // mock user fetch twice
  integrationHelper.routes.northstar
    .intercept.fetchUserByMobile(inboundRequestPayload.From, member, 2);

  // mock user update twice
  integrationHelper.routes.northstar
    .intercept.updateUserById(member.data.id, member, 2);

  /**
   * 1st attempt
   */
  const res1 = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set({
      Authorization: `Basic ${integrationHelper.getAuthKey()}`,
      [metadataParserConfig.metadata.headers.requestId]: requestId,
    })
    .send(inboundRequestPayload);

  res1.status.should.be.equal(200);
  res1.body.data.messages.inbound.length.should.be.equal(1);
  res1.body.data.messages.outbound.length.should.be.equal(1);

  const outboundMessage1 = res1.body.data.messages.outbound[0];

  /**
   * 2nd attempt (retry)
   */
  const res2 = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set({
      Authorization: `Basic ${integrationHelper.getAuthKey()}`,
      [metadataParserConfig.metadata.headers.requestId]: requestId,
      [metadataParserConfig.metadata.headers.retryCount]: '1',
    })
    .send(inboundRequestPayload);

  res2.status.should.be.equal(200);
  res2.body.data.messages.inbound.length.should.be.equal(1);
  res2.body.data.messages.outbound.length.should.be.equal(1);

  const outboundMessage2 = res2.body.data.messages.outbound[0];

  // The retry should not have replaced the platformUserId of the message
  outboundMessage1.platformMessageId.should.be.equal(outboundMessage2.platformMessageId);
});

test('POST /api/v2/messages?origin=twilio outbound message should match sendInfoMessage if user texts INFO', async (t) => {
  const message = {
    getSmsMessageSid: stubs.twilio.getSmsMessageSid(),
    From: stubs.getMobileNumber('valid'),
    Body: 'info',
  };
  const member = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchConversationTriggers(), 1);

  // mock user fetch
  integrationHelper.routes.northstar
    .intercept.fetchUserByMobile(message.From, member, 1);

  // mock user update
  integrationHelper.routes.northstar
    .intercept.updateUserById(member.data.id, member, 1);

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
    Body: 'help',
  };
  const member = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchConversationTriggers(), 1);

  // mock user fetch
  integrationHelper.routes.northstar
    .intercept.fetchUserByMobile(message.From, member, 1);

  // mock user update
  integrationHelper.routes.northstar
    .intercept.updateUserById(member.data.id, member, 1);

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
