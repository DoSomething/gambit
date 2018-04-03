'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');

const integrationHelper = require('../../../helpers/integration');

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
