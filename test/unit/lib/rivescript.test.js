'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

const RiveScript = require('rivescript');

const stubs = require('../../helpers/stubs');
const config = require('../../../config/lib/rivescript');

// Module to test
const rivescript = rewire('../../../lib/rivescript');

const userId = stubs.getUserId();
const topicId = 'random';
const messageText = stubs.getRandomMessageText();

test.afterEach(() => {
  sandbox.restore();
  rivescript.__set__('additionalRivescripts', undefined);
  rivescript.__set__('brain', undefined);
  rivescript.__set__('config', config);
  rivescript.__set__('hasSortedReplies', false);
  rivescript.__set__('RiveScript', undefined);
});

// getAdditionalRivescripts
test('getAdditionalRivescripts should return additionalRivescripts const', () => {
  const data = ['123', '456'];
  rivescript.__set__('additionalRivescripts', data);

  const result = rivescript.getAdditionalRivescripts();
  result.should.deep.equal(data);
});

// getBot
test('getBot should create a new Rivescript bot if brain undefined', () => {
  const RiveScriptSpy = sandbox.spy();
  rivescript.__set__('RiveScript', RiveScriptSpy);

  rivescript.getBot();
  RiveScriptSpy.should.have.been.calledWithNew;
});

test('getBot should return the existing Rivescript bot if already created', () => {
  const RiveScriptSpy = sandbox.spy();
  rivescript.__set__('RiveScript', RiveScriptSpy);
  const newClient = rivescript.getBot();
  const sameClient = rivescript.getBot();

  // test
  RiveScriptSpy.should.have.been.calledWithNew;
  RiveScriptSpy.should.have.been.calledOnce;
  newClient.should.be.equal(sameClient);
});

// getBotReply
test('getBotReply should throw an error if brain undefined', async (t) => {
  await t.throws(rivescript.getBotReply(userId, topicId, messageText));
});

test('getBotReply should throw an error if not hasSortedReplies', async (t) => {
  rivescript.__set__('brain', new RiveScript());
  await t.throws(rivescript.getBotReply(userId, topicId, messageText));
});

test('getBotReply should return object if brain exists and hasSortedReplies', async () => {
  const getUservarsResponse = {};
  getUservarsResponse[userId] = {
    topic: 'mockTopicId',
    __initialmatch__: 'mockMatch',
  };
  rivescript.__set__('brain', {
    getUservars: () => Promise.resolve(getUservarsResponse),
    setUservar: () => Promise.resolve(),
    reply: () => Promise.resolve('mockReplyText'),
  });
  rivescript.__set__('hasSortedReplies', true);

  const result = await rivescript.getBotReply(userId, topicId, messageText);
  result.text.should.equal('mockReplyText');
  result.topicId.should.equal('mockTopicId');
  result.match.should.equal('mockMatch');
});

// isReady
test('isReady should return hasSortedReplies', (t) => {
  t.falsy(rivescript.isReady());
  rivescript.__set__('hasSortedReplies', true);
  t.truthy(rivescript.isReady());
});

// loadBotWithRivescripts
test('loadBotWithRivescripts should return error if rivescripts arg is not passsed', async (t) => {
  await t.throws(rivescript.loadBotWithRivescripts());
});

test('loadBotWithRivescripts should call createNewBot', async () => {
  const rivescripts = ['123'];
  const createNewBotSpy = sandbox.spy();
  rivescript.__set__('createNewBot', createNewBotSpy);
  rivescript.__set__('brain', {
    loadDirectory: () => Promise.resolve(),
  });
  sandbox.stub(rivescript, 'streamAndSortReplies')
    .returns(Promise.resolve());
  await rivescript.loadBotWithRivescripts(rivescripts);
  createNewBotSpy.should.have.been.called;
  rivescript.streamAndSortReplies.should.have.been.called;
});
