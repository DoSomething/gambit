'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const underscore = require('underscore');

const graphql = require('../../../../lib/graphql');
const rivescriptApi = require('../../../../lib/rivescript');
const helpers = require('../../../../lib/helpers');
const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');
const conversationTriggerFactory = require('../../../helpers/factories/conversationTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const lineBreak = config.separators.line;
const mockWord = stubs.getRandomWord();
const mockDeparsedRivescript = { topics: { random: [], ask_yes_no: [] } };
const mockRivescriptCommand = `${config.commands.trigger}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${lineBreak}`;
const mockReplyLine = `${config.commands.reply}${config.separators.command}${mockWord}${lineBreak}`;
const mockRivescript = [mockRivescriptLine, mockReplyLine].join(lineBreak);
const mockRivescriptReply = {
  text: stubs.getRandomMessageText(),
  topic: stubs.getContentfulId(),
};
const conversationTrigger = conversationTriggerFactory.getValidConversationTrigger();

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// appendEscapedLinebreak
test('appendEscapedLinebreak should append escaped linebreak character to text', () => {
  const text = stubs.getRandomMessageText();
  const result = rivescriptHelper.appendEscapedLinebreak(text);
  result.should.equal(`${text}\\n`);
});

// appendTopicTag
test('appendTopicTag should append Rivescript topic tag to string with given topicId', () => {
  const text = stubs.getRandomMessageText();
  const topicId = stubs.getContentfulId();
  const result = rivescriptHelper.appendTopicTag(text, topicId);
  result.should.equal(`${text}{topic=${topicId}}`);
});

// getBotReply
test('getBotReply should call loadBot if Rivescript is not current', async () => {
  sandbox.stub(rivescriptHelper, 'isRivescriptCurrent')
    .returns(Promise.resolve(false));
  sandbox.stub(rivescriptHelper, 'loadBot')
    .returns(Promise.resolve(true));
  sandbox.stub(rivescriptApi, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.getBotReply();
  rivescriptHelper.loadBot.should.have.been.called;
  result.should.deep.equal(mockRivescriptReply);
});

test('getBotReply does not call loadBot if Rivescript is current', async () => {
  sandbox.stub(rivescriptHelper, 'isRivescriptCurrent')
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
test('getDeparsedRivescript should call Rivescript getBot.deparse', () => {
  sandbox.stub(rivescriptApi, 'getBot')
    .callsFake(() => ({
      deparse: () => { // eslint-disable-line arrow-body-style
        return mockDeparsedRivescript;
      },
    }));

  const result = rivescriptHelper.getDeparsedRivescript();
  result.should.deep.equal(mockDeparsedRivescript);
});

// getRivescripts
test('getRivescripts should return cache data if cache set', async () => {
  const data = [conversationTrigger, conversationTrigger];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(data));
  sandbox.stub(rivescriptHelper, 'fetchRivescripts')
    .returns(Promise.resolve(true));

  const result = await rivescriptHelper.getRivescripts();
  rivescriptHelper.fetchRivescripts.should.not.have.been.called;
  result.should.deep.equal(data);
});

test('getRivescripts should call fetchRivescripts if not cache set', async () => {
  const data = [conversationTrigger, conversationTrigger];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(false));
  sandbox.stub(rivescriptHelper, 'fetchRivescripts')
    .returns(Promise.resolve(data));

  const result = await rivescriptHelper.getRivescripts();
  rivescriptHelper.fetchRivescripts.should.have.been.called;
  result.should.deep.equal(data);
});

test('getRivescripts should call fetchRivescripts if resetCache arg is true', async () => {
  const data = [conversationTrigger, conversationTrigger];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve({ test: 123 }));
  sandbox.stub(rivescriptHelper, 'fetchRivescripts')
    .returns(Promise.resolve(data));

  const result = await rivescriptHelper.getRivescripts(true);
  rivescriptHelper.fetchRivescripts.should.have.been.called;
  helpers.cache.rivescript.get.should.not.have.been.called;
  result.should.deep.equal(data);
});

test('fetchRivescripts should call graphql.fetchConversationTriggers and parseRivescript', async () => {
  const data = [conversationTrigger, conversationTrigger];
  const mockParsedTrigger = conversationTriggerFactory.getValidConversationTrigger();
  sandbox.stub(graphql, 'fetchConversationTriggers')
    .returns(Promise.resolve(data));
  sandbox.stub(rivescriptHelper, 'parseRivescript')
    .returns(mockParsedTrigger);
  sandbox.stub(helpers.cache.rivescript, 'set')
    .returns(Promise.resolve([mockParsedTrigger, mockParsedTrigger]));

  const result = await rivescriptHelper.fetchRivescripts();
  data.forEach((item) => {
    rivescriptHelper.parseRivescript.should.have.been.calledWith(item);
  });
  graphql.fetchConversationTriggers.should.have.been.called;
  result.should.deep.equal([mockParsedTrigger, mockParsedTrigger]);
});

test('fetchRivescripts should throw on graphql.fetchConversationTriggers fail', async (t) => {
  const mockError = new Error('epic fail');
  sandbox.stub(graphql, 'fetchConversationTriggers')
    .returns(Promise.reject(mockError));
  sandbox.stub(rivescriptHelper, 'parseRivescript')
    .returns(conversationTrigger);

  const result = await t.throws(rivescriptHelper.fetchRivescripts());
  graphql.fetchConversationTriggers.should.have.been.called;
  rivescriptHelper.parseRivescript.should.not.have.been.called;
  result.should.deep.equal(mockError);
});

// formatReplyRivescript
test('formatReplyRivescript return array of Rivescript lines without topic tag if null topicId', () => {
  const data = [
    { operator: '+', value: 'Beginning' },
    { operator: '+', value: 'Middle' },
    { operator: '^', value: 'The end' },
  ];
  const line = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'parseReplyRivescriptLines')
    .returns(data);
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(line);
  const replyText = stubs.getRandomMessageText();
  const topicId = null;

  const result = rivescriptHelper.formatReplyRivescript(replyText, topicId);
  rivescriptHelper.parseReplyRivescriptLines.should.have.been.calledWith(replyText, topicId);
  data.forEach((item) => {
    rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(item.operator, item.value);
  });
  result.should.deep.equal([line, line, line]);
});

// formatRivescriptLine
test('formatRivescriptLine should return a trimmed concat of operator and value args', () => {
  const result = rivescriptHelper.formatRivescriptLine(config.commands.trigger, `${mockWord}   `);
  result.should.equal(mockRivescriptLine);
});

// formatTriggerRivescript
test('formatTriggerRivescript should return trigger command with triggerText as rs line', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);

  const result = rivescriptHelper.formatTriggerRivescript(mockWord);
  rivescriptHelper.formatRivescriptLine
    .should.have.been.calledWith(config.commands.trigger, mockWord);
  result.should.equal(mockRivescriptLine);
});

// parseReplyRivescriptLines
test('parseReplyRivescriptLines should throw if replyText undefined', (t) => {
  t.throws(() => rivescriptHelper.parseReplyRivescriptLines());
});

test('parseReplyRivescriptLines should return an array with one reply command if replyText does not have linebreaks', () => {
  const text = stubs.getRandomMessageText();
  const result = rivescriptHelper.parseReplyRivescriptLines(text);
  result.should.deep.equal([
    { operator: config.commands.reply, value: text },
  ]);
});

test('parseReplyRivescriptLines should return an array with one reply command if replyText leads with a line break', () => {
  const text = stubs.getRandomMessageText();
  let result = rivescriptHelper.parseReplyRivescriptLines(`\n${text}`);
  result.should.deep.equal([
    { operator: config.commands.reply, value: text },
  ]);
  result = rivescriptHelper.parseReplyRivescriptLines(`\n\n${text}`);
  result.should.deep.equal([
    { operator: config.commands.reply, value: text },
  ]);
});

test('parseReplyRivescriptLines should return an array with reply command and 2 continuation commands if replyText has 2 repeating linebreaks', () => {
  const firstParagraphText = stubs.getRandomMessageText();
  const secondParagraphText = stubs.getRandomMessageText();
  const lastParagraphText = stubs.getRandomMessageText();
  const text = `${firstParagraphText}\n\n${secondParagraphText}\n\n${lastParagraphText}`;
  const result = rivescriptHelper.parseReplyRivescriptLines(text, null);
  result.should.deep.equal([
    { operator: config.commands.reply, value: `${firstParagraphText}\\n` },
    { operator: config.commands.continuation, value: `${secondParagraphText}\\n` },
    { operator: config.commands.continuation, value: lastParagraphText },
  ]);
});

test('parseReplyRivescriptLines should return an array with 1 reply, 1 continuation without topic tag, and 1 continuation with appended topic tag if replyText has 2 repeating linebreaks and topicId arg exists', () => {
  const firstParagraphText = stubs.getRandomMessageText();
  const secondParagraphText = stubs.getRandomMessageText();
  const lastParagraphText = stubs.getRandomMessageText();
  const text = `${firstParagraphText}\n\n${secondParagraphText}\n\n${lastParagraphText}`;
  const topicId = stubs.getContentfulId();
  const appendTopicTagResult = `${lastParagraphText}{topic=${topicId}}`;
  sandbox.stub(rivescriptHelper, 'appendTopicTag')
    .returns(appendTopicTagResult);

  const result = rivescriptHelper.parseReplyRivescriptLines(text, topicId);
  result.should.deep.equal([
    { operator: config.commands.reply, value: `${firstParagraphText}\\n` },
    { operator: config.commands.continuation, value: `${secondParagraphText}\\n` },
    { operator: config.commands.continuation, value: appendTopicTagResult },
  ]);
  rivescriptHelper.appendTopicTag.should.have.been.calledWith(lastParagraphText, topicId);
});

// TODO: Add test for closed campaign.
test('parseRivescript calls replyRivescript with defaultTopicTrigger.reply if set', () => {
  const trigger = stubs.getRandomWord();
  const reply = stubs.getRandomWord();
  sandbox.stub(rivescriptHelper, 'formatTriggerRivescript')
    .returns(trigger);
  sandbox.stub(rivescriptHelper, 'formatReplyRivescript')
    .returns(reply);
  sandbox.stub(rivescriptHelper, 'joinRivescriptLines')
    .returns(mockRivescript);

  const result = rivescriptHelper.parseRivescript(conversationTrigger);
  rivescriptHelper.formatTriggerRivescript.should.have.been
    .calledWith(conversationTrigger.trigger);
  rivescriptHelper.formatReplyRivescript.should.have.been
    .calledWith(conversationTrigger.reply, null);
  rivescriptHelper.joinRivescriptLines.should.have.been.calledWith([trigger, reply]);
  result.should.equal(mockRivescript);
});

// isBotReady
test('isBotReady returns false if not rivescript.isReady', async () => {
  sandbox.stub(rivescriptApi, 'isReady')
    .returns(false);
  const result = await rivescriptHelper.isBotReady();
  result.should.equal(false);
});

test('isBotReady returns true if rivescript.isReady', async () => {
  sandbox.stub(rivescriptApi, 'isReady')
    .returns(true);
  const result = await rivescriptHelper.isBotReady();
  result.should.equal(true);
});

// isRivescriptCurrent
test('isRivescriptCurrent returns false if rivescript cache is not set', async () => {
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(null));
  const result = await rivescriptHelper.isRivescriptCurrent();
  result.should.equal(false);
});

test('isRivescriptCurrent returns true if cache is equal to additionalRivescripts and rivescript is ready', async () => {
  const rivescripts = [mockRivescript, mockRivescript];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve(rivescripts));
  sandbox.stub(rivescriptApi, 'getAdditionalRivescripts')
    .returns(rivescripts);
  const result = await rivescriptHelper.isRivescriptCurrent();
  result.should.equal(true);
});

test('isRivescriptCurrent returns false if cache is not equal to additionalRivescripts and rivescript is ready', async () => {
  const rivescripts = [mockRivescript, mockRivescript];
  sandbox.stub(helpers.cache.rivescript, 'get')
    .returns(Promise.resolve([mockRivescript]));
  sandbox.stub(rivescriptApi, 'getAdditionalRivescripts')
    .returns(rivescripts);
  const result = await rivescriptHelper.isRivescriptCurrent();
  result.should.equal(false);
});

// joinRivescriptLines
test('joinRivescriptLines returns input array joined by the config line separator', () => {
  const lines = [mockRivescript, mockRivescript, mockRivescript];
  const result = rivescriptHelper.joinRivescriptLines(lines);
  result.should.equal(lines.join(lineBreak));
});

// loadBot
test('loadBot calls getRivescripts and creates a new Rivescript bot with result', async () => {
  const getRivescripts = [conversationTrigger, conversationTrigger, conversationTrigger];
  sandbox.stub(rivescriptHelper, 'getRivescripts')
    .returns(Promise.resolve(getRivescripts));
  sandbox.stub(rivescriptApi, 'loadBotWithRivescripts')
    .returns(underscore.noop);

  await rivescriptHelper.loadBot(true);
  rivescriptHelper.getRivescripts.should.have.been.calledWith(true);
  rivescriptApi.loadBotWithRivescripts.should.have.been
    .calledWith(getRivescripts);
});

// parseAskMultipleChoiceResponse
test('parseAskMultipleChoiceResponse should call rivescriptHelper.getBotReply with ask_multiple_choice and return result text', async () => {
  const messageText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.parseAskMultipleChoiceResponse(messageText);
  rivescriptHelper.getBotReply
    .should.have.been.calledWith('global', 'ask_multiple_choice', messageText);
  result.should.deep.equal(mockRivescriptReply.text);
});

// parseAskSubscriptionStatusResponse
test('parseAskSubscriptionStatusResponse should call rivescriptHelper.getBotReply with ask_subscription_status and return result text', async () => {
  const messageText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.parseAskSubscriptionStatusResponse(messageText);
  rivescriptHelper.getBotReply
    .should.have.been.calledWith('global', 'ask_subscription_status', messageText);
  result.should.deep.equal(mockRivescriptReply.text);
});

// parseAskVotingPlanStatusResponse
test('parseAskVotingPlanStatusResponse should call rivescriptHelper.getBotReply with ask_voting_plan_status topic and return result text', async () => {
  const messageText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.parseAskVotingPlanStatusResponse(messageText);
  rivescriptHelper.getBotReply
    .should.have.been.calledWith('global', 'ask_voting_plan_status', messageText);
  result.should.deep.equal(mockRivescriptReply.text);
});

// parseAskYesNoResponse
test('parseAskYesNoResponse should call rivescriptHelper.getBotReply with ask_yes_no topic and return result text', async () => {
  const messageText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'getBotReply')
    .returns(Promise.resolve(mockRivescriptReply));

  const result = await rivescriptHelper.parseAskYesNoResponse(messageText);
  rivescriptHelper.getBotReply
    .should.have.been.calledWith('global', 'ask_yes_no', messageText);
  result.should.deep.equal(mockRivescriptReply.text);
});

// parseRivescript
test('parseRivescript should throw error if defaultTopicTrigger undefined', (t) => {
  t.throws(() => rivescriptHelper.parseRivescript());
});

// TODO: Add test for changeTopicMacro
