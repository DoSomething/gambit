'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');

const gambitCampaigns = require('../../../../lib/gambit-campaigns');
const rivescriptApi = require('../../../../lib/rivescript');
const helpers = require('../../../../lib/helpers');
const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');
const defaultTopicTriggerFactory = require('../../../helpers/factories/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const lineBreak = config.separators.line;
const mockWord = stubs.getRandomWord();
const mockDeparsedRivescript = { topics: { random: [], ask_yes_no: [] } };
const mockRivescriptCommand = `${config.commands.trigger}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${lineBreak}`;
const mockRedirectLine = `${config.commands.redirect}${config.separators.command}${mockWord}${lineBreak}`;
const mockReplyLine = `${config.commands.reply}${config.separators.command}${mockWord}${lineBreak}`;
const mockRivescript = [mockRivescriptLine, mockReplyLine].join(lineBreak);
const mockRivescriptReply = {
  text: stubs.getRandomMessageText(),
  topic: stubs.getContentfulId(),
};
const replyTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
const redirectTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// getBotReply
test('getBotReply should call loadBot if rivescript cache is not set', async () => {
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(false));
  sandbox.stub(rivescriptHelper, 'loadBot')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptApi, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.getBotReply();
  rivescriptHelper.loadBot.should.have.been.called;
  result.should.deep.equal(mockRivescriptReply);
});

test('getBotReply does not call loadBot if rivescript cache is set', async () => {
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptHelper, 'loadBot')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptApi, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.getBotReply();
  rivescriptHelper.loadBot.should.not.have.been.called;
  result.should.deep.equal(mockRivescriptReply);
});

// getDeparsedRivescript
test('getDeparsedRivescript should call loadBot if rivescript is not ready', async () => {
  sandbox.stub(rivescriptApi, 'isReady')
    .returns(false);
  sandbox.stub(rivescriptHelper, 'loadBot')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptApi, 'getBot')
    .callsFake(() => ({
      deparse: () => { // eslint-disable-line arrow-body-style
        return mockDeparsedRivescript;
      },
    }));

  const result = await rivescriptHelper.getDeparsedRivescript();
  rivescriptHelper.loadBot.should.have.been.called;
  result.should.deep.equal(mockDeparsedRivescript);
});

test('getDeparsedRivescript does not call loadBot if rivescript is ready', async () => {
  sandbox.stub(rivescriptApi, 'isReady')
    .returns(true);
  sandbox.stub(rivescriptHelper, 'loadBot')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptApi, 'getBot')
    .callsFake(() => ({
      deparse: () => { // eslint-disable-line arrow-body-style
        return mockDeparsedRivescript;
      },
    }));

  const result = await rivescriptHelper.getDeparsedRivescript();
  rivescriptHelper.loadBot.should.not.have.been.called;
  result.should.deep.equal(mockDeparsedRivescript);
});

// getRivescripts
test('getRivescripts should return cache data if cache set', async () => {
  const data = [replyTrigger, redirectTrigger];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(data));
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve(true));

  const result = await rivescriptHelper.getRivescripts();

  gambitCampaigns.fetchDefaultTopicTriggers.should.not.have.been.called;
  result.should.deep.equal(data);
});

test('getRivescripts should call gambitCampaigns.fetchDefaultTopicTriggers if cache not set', async () => {
  const data = [replyTrigger, redirectTrigger];
  const mockParsedTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(null));
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.resolve({ data }));
  sandbox.stub(rivescriptHelper, 'parseRivescript')
    .returns(mockParsedTrigger);

  const result = await rivescriptHelper.getRivescripts();
  data.forEach((item) => {
    rivescriptHelper.parseRivescript.should.have.been.calledWith(item);
  });
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  result.should.deep.equal([mockParsedTrigger, mockParsedTrigger]);
});

test('getRivescripts should throw on gambitCampaigns.fetchDefaultTopicTriggers fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(null));
  sandbox.stub(gambitCampaigns, 'fetchDefaultTopicTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(rivescriptHelper, 'parseRivescript')
    .returns(replyTrigger);

  const result = await t.throws(rivescriptHelper.getRivescripts());
  gambitCampaigns.fetchDefaultTopicTriggers.should.have.been.called;
  rivescriptHelper.parseRivescript.should.not.have.been.called;
  result.should.deep.equal(mockError);
});

// formatRivescriptLine
test('formatRivescriptLine should return a trimmed concat of operator and value args', () => {
  const result = rivescriptHelper.formatRivescriptLine(config.commands.trigger, `${mockWord}   `);
  result.should.equal(mockRivescriptLine);
});

// getRivescriptFromTriggerTextAndRivescriptLine
test('getRivescriptFromTriggerTextAndRivescriptLine should array with triggerText as rs line and given rs line ', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  sandbox.stub(rivescriptHelper, 'joinRivescriptLines')
    .returns(mockRivescript);

  const result = rivescriptHelper
    .getRivescriptFromTriggerTextAndRivescriptLine(mockWord, mockReplyLine);
  rivescriptHelper.formatRivescriptLine
    .should.have.been.calledWith(config.commands.trigger, mockWord);
  rivescriptHelper.joinRivescriptLines
    .should.have.been.calledWith([mockRivescriptLine, mockReplyLine]);
  result.should.equal(mockRivescript);
});

// getRedirectRivescript
test('getRedirectRivescript should return Rivescript with trigger and redirect commands', () => {
  const mockRedirectText = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRedirectLine);
  sandbox.stub(rivescriptHelper, 'getRivescriptFromTriggerTextAndRivescriptLine')
    .returns(mockRivescript);

  const result = rivescriptHelper.getRedirectRivescript(mockWord, mockRedirectText);
  rivescriptHelper.formatRivescriptLine
    .should.have.been.calledWith(config.commands.redirect, mockRedirectText);
  rivescriptHelper.getRivescriptFromTriggerTextAndRivescriptLine
    .should.have.been.calledWith(mockWord, mockRedirectLine);
  result.should.equal(mockRivescript);
});

// getReplyRivescript
test('getReplyRivescript should return Rivescript with trigger and reply commands', () => {
  const mockReplyText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockReplyLine);
  sandbox.stub(rivescriptHelper, 'getRivescriptFromTriggerTextAndRivescriptLine')
    .returns(mockRivescript);

  const result = rivescriptHelper.getReplyRivescript(mockWord, mockReplyText);
  rivescriptHelper.formatRivescriptLine
    .should.have.been.calledWith(config.commands.reply, mockReplyText);
  rivescriptHelper.getRivescriptFromTriggerTextAndRivescriptLine
    .should.have.been.calledWith(mockWord, mockReplyLine);
  result.should.equal(mockRivescript);
});

// getRivescriptFromDefaultTopicTrigger
test('getRivescriptFromDefaultTopicTrigger returns redirectRivescript if defaultTopicTrigger.redirect is set', () => {
  sandbox.stub(rivescriptHelper, 'getRedirectRivescript')
    .returns(mockRivescript);
  sandbox.stub(rivescriptHelper, 'getReplyRivescript')
    .returns(mockRivescript);
  const redirectDefaultTopicTrigger = defaultTopicTriggerFactory
    .getValidRedirectDefaultTopicTrigger();

  const result = rivescriptHelper.getRivescriptFromDefaultTopicTrigger(redirectDefaultTopicTrigger);
  rivescriptHelper.getReplyRivescript.should.not.have.been.called;
  rivescriptHelper.getRedirectRivescript
    .should.have.been
    .calledWith(redirectDefaultTopicTrigger.trigger, redirectDefaultTopicTrigger.redirect);
  result.should.equal(mockRivescript);
});

test('getRivescriptFromDefaultTopicTrigger returns replyRivescript if defaultTopicTrigger.redirect is not set', () => {
  sandbox.stub(rivescriptHelper, 'getRedirectRivescript')
    .returns(mockRivescript);
  sandbox.stub(rivescriptHelper, 'getReplyRivescript')
    .returns(mockRivescript);
  const replyDefaultTopicTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();

  const result = rivescriptHelper.getRivescriptFromDefaultTopicTrigger(replyDefaultTopicTrigger);
  rivescriptHelper.getRedirectRivescript.should.not.have.been.called;
  rivescriptHelper.getReplyRivescript.should.have.been
    .calledWith(replyDefaultTopicTrigger.trigger, replyDefaultTopicTrigger.reply);
  result.should.equal(mockRivescript);
});

// joinRivescriptLines
test('joinRivescriptLines returns input array joined by the config line separator', () => {
  const lines = [mockRivescript, mockRivescript, mockRivescript];
  const result = rivescriptHelper.joinRivescriptLines(lines);
  result.should.equal(lines.join(lineBreak));
});

// loadBot
test('loadBot calls getRivescripts and creates a new Rivescript bot with result', async () => {
  const getRivescripts = [replyTrigger, redirectTrigger, replyTrigger];
  sandbox.stub(rivescriptHelper, 'getRivescripts')
    .returns(Promise.resolve(getRivescripts));
  sandbox.stub(rivescriptApi, 'loadBotWithRivescripts')
    .returns(underscore.noop);

  await rivescriptHelper.loadBot();
  rivescriptHelper.getRivescripts.should.have.been.called;
  rivescriptApi.loadBotWithRivescripts.should.have.been
    .calledWith(getRivescripts);
});

// parseRivescript
test('parseRivescript should throw error if defaultTopicTrigger undefined', (t) => {
  t.throws(() => rivescriptHelper.parseRivescript());
});

test('parseRivescript should return defaultTopicTrigger if defaultTopicTrigger.topicId undefined', () => {
  const defaultTopicTrigger = defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger();
  sandbox.stub(rivescriptHelper, 'getRivescriptFromDefaultTopicTrigger')
    .returns(mockRivescript);
  const result = rivescriptHelper.parseRivescript(defaultTopicTrigger);
  result.should.deep.equal(mockRivescript);
});

// TODO: Add test for changeTopicMacro
