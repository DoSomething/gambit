'use strict';

const test = require('ava');
const chai = require('chai');

const integrationHelper = require('../../../helpers/integration');
const seederHelper = require('../../../helpers/integration/seeder');

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
});

test.after.always(async () => {
  await integrationHelper.hooks.db.disconnect();
});

/**
 * GET /
 */
test('GET / should return 200', async (t) => {
  const res = await t.context.request.get('/');
  res.status.should.be.equal(200);
});

/**
 * GET /api/v1/messages
 */

test('GET /api/v1/messages', async (t) => {
  await seederHelper.seed.messages(2);

  const res = await t.context.request.get(integrationHelper.routes.v1.messages())
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`);
  res.status.should.be.equal(200);
  res.body.length.should.be.equal(2);
});

test('GET /api/v1/messages/:id', async (t) => {
  const messages = await seederHelper.seed.messages(1);

  const res = await t.context.request.get(integrationHelper.routes.v1.messages(messages[0].id))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`);
  res.status.should.be.equal(200);
  res.body._id.should.be.eql(messages[0].id);
});

/**
 * GET /api/v1/conversations
 */

test('GET /api/v1/conversations', async (t) => {
  await seederHelper.seed.conversations(2);

  const res = await t.context.request.get(integrationHelper.routes.v1.conversations())
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`);
  res.status.should.be.equal(200);
  res.body.length.should.be.equal(2);
});

test('GET /api/v1/conversations/:id', async (t) => {
  const conversations = await seederHelper.seed.conversations(1);

  const res = await t.context.request.get(
    integrationHelper.routes.v1.conversations(conversations[0].id))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`);
  res.status.should.be.equal(200);
  res.body._id.should.be.eql(conversations[0].id);
});
