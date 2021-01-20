'use strict';

const test = require('ava');
const chai = require('chai');

// helpers
const integrationHelper = require('../../../../helpers/integration');
const stubs = require('../../../../helpers/stubs');

// configs
const metadataParserConfig = require('../../../../../config/lib/middleware/metadata-parse');
const rivescriptMacro = require('../../../../../config/lib/helpers/macro');
const rateLimitersConfig = require('../../../../../config/rate-limiters');

const rateLimiters = require('../../../../../lib/rate-limiters');
// Should have been already initialized when bootstrapping app so we would just
// be getting the cached list of initialized rate limiters here
const { memberRoute: memberRouteRateLimiter } = rateLimiters.getRegistry();

chai.should();

// Deletes rate limit state of the given key from the in-memory rate limiter
async function rewindRateLimit(key) {
  await memberRouteRateLimiter.delete(key);
}

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

function mockExternalCallsForUserInputMessage(message) {
  const member = stubs.northstar.getUser({
    validUsNumber: true,
  });

  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchConversationTriggers(), 1);

  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchVotingInformationByLocation(), 1);

  // mock user fetch
  integrationHelper.routes.northstar
    .intercept.fetchUserByMobile(message.From, member, 1);

  // mock user update
  integrationHelper.routes.northstar
    .intercept.updateUserById(member.data.id, member, 1);

  integrationHelper.routes.northstar
    .intercept.fetchUserById(stubs.getUserId(), member, 1);

  // mock bertly link shortener
  integrationHelper.routes.bertly.intercept(stubs.bertly.getBertlyUrl('https://dosome.click/zt6mc').messageText);
}

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

  // mock graphQL query twice
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

test.serial('POST /api/v2/messages?origin=twilio outbound message should match sendInfoMessage if user texts INFO', async (t) => {
  const message = {
    getSmsMessageSid: stubs.twilio.getSmsMessageSid(),
    From: stubs.getMobileNumber('valid'),
    Body: 'info',
  };

  mockExternalCallsForUserInputMessage(message);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(message);
  res.status.should.be.equal(200);
  res.body.data.messages.outbound[0].text.should.equal(rivescriptMacro.macros.sendInfoMessage.text);
  res.body.data.messages.outbound[0].topic.should.equal('random');
});

test.serial('POST /api/v2/messages?origin=twilio outbound message should match sendInfoMessage if user texts HELP', async (t) => {
  const message = {
    getSmsMessageSid: stubs.twilio.getSmsMessageSid(),
    From: stubs.getMobileNumber('valid'),
    Body: 'help',
  };

  mockExternalCallsForUserInputMessage(message);

  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send(message);
  res.status.should.be.equal(200);
  res.body.data.messages.outbound[0].text.should.equal(rivescriptMacro.macros.sendInfoMessage.text);
  res.body.data.messages.outbound[0].topic.should.equal('random');
});

/*
 TODO: Uncomment this -- seems to break CircleCI.

test.serial('POST /api/v2/messages?origin=twilio should trigger rate limiter', async (t) => {
  const member = stubs.northstar.getUser({ validUsNumber: true });
  const inboundRequestPayload = stubs.twilio.getInboundRequestBody(member);
  const rateLimiterUpperBound = rateLimitersConfig.memberRoute.init.points;
  // Let's make sure this key has all it's rate limit points.
  await rewindRateLimit(inboundRequestPayload.From);

  // mock graphQL query twice
  integrationHelper.routes.graphql
    .intercept(stubs.graphql.fetchConversationTriggers(), rateLimiterUpperBound + 1);

  // mock user fetch twice
  integrationHelper.routes.northstar
    .intercept.fetchUserByMobile(inboundRequestPayload.From, member, rateLimiterUpperBound + 1);

  // mock user update twice
  integrationHelper.routes.northstar
    .intercept.updateUserById(member.data.id, member, rateLimiterUpperBound + 1);

  [...Array(rateLimiterUpperBound).keys()].forEach(async () => {
    const res = await t.context.request
      .post(integrationHelper.routes.v2.messages(false, {
        origin: 'twilio',
      }))
      .set({
        Authorization: `Basic ${integrationHelper.getAuthKey()}`,
      })
      .send(inboundRequestPayload);

    res.status.should.be.equal(200);
    res.body.data.messages.inbound.length.should.be.equal(1);
    res.body.data.messages.outbound.length.should.be.equal(1);
  });

  // should be rate limited
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(false, {
      origin: 'twilio',
    }))
    .set({
      Authorization: `Basic ${integrationHelper.getAuthKey()}`,
    })
    .send(inboundRequestPayload);

  res.status.should.be.equal(429);
  res.headers.should.include.keys(
    'retry-after',
    'x-ratelimit-remaining',
    'x-ratelimit-reset',
  );
});
*/
