'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');
const defaultTopicTriggerFactory = require('../../../helpers/factories/defaultTopicTrigger');

chai.should();
chai.use(sinonChai);

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const lineBreak = config.separators.line;
const mockWord = stubs.getRandomWord();
const mockRivescriptCommand = `${config.commands.trigger}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${lineBreak}`;
const mockRedirectLine = `${config.commands.redirect}${config.separators.command}${mockWord}${lineBreak}`;
const mockReplyLine = `${config.commands.reply}${config.separators.command}${mockWord}${lineBreak}`;
const mockRivescript = [mockRivescriptLine, mockReplyLine].join(lineBreak);

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
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

// getRivescriptFromDefaultTopicTriggers
test('getRivescriptFromDefaultTopicTriggers returns joined getRivescriptFromDefaultTopicTrigger results', () => {
  const allRivescripts = [mockRivescript, mockRivescript, mockRivescript].join(lineBreak);
  sandbox.stub(rivescriptHelper, 'getRivescriptFromDefaultTopicTrigger')
    .returns(mockRivescript);
  sandbox.stub(rivescriptHelper, 'joinRivescriptLines')
    .returns(allRivescripts);
  const defaultTopicTriggers = [
    defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger(),
    defaultTopicTriggerFactory.getValidReplyDefaultTopicTrigger(),
    defaultTopicTriggerFactory.getValidRedirectDefaultTopicTrigger(),
  ];

  const result = rivescriptHelper.getRivescriptFromDefaultTopicTriggers(defaultTopicTriggers);
  defaultTopicTriggers.forEach((item) => {
    rivescriptHelper.getRivescriptFromDefaultTopicTrigger.should.have.been.calledWith(item);
  });
  rivescriptHelper.joinRivescriptLines
    .should.have.been.calledWith([mockRivescript, mockRivescript, mockRivescript]);
  result.should.equal(allRivescripts);
});

// joinRivescriptLines
test('joinRivescriptLines returns input array joined by the config line separator', () => {
  const lines = [mockRivescript, mockRivescript, mockRivescript];
  const result = rivescriptHelper.joinRivescriptLines(lines);
  result.should.equal(lines.join(lineBreak));
});
