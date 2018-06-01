'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');

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
test('getRivescriptFromDefaultTopicTrigger should return null if no defaultTopicTrigger', (t) => {
  const mockReplyText = stubs.getRandomMessageText();
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockReplyLine);
  sandbox.stub(rivescriptHelper, 'getRivescriptFromTriggerTextAndRivescriptLine')
    .returns(mockRivescript);

  const result = rivescriptHelper.getRivescriptFromDefaultTopicTrigger();
  t.is(result, null);
});
