'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const config = require('../../../../config/lib/helpers/rivescript');
const stubs = require('../../../helpers/stubs');

// module to be tested
const rivescriptHelper = require('../../../../lib/helpers/rivescript');

const mockWord = stubs.getRandomWord();
const mockRivescriptCommandOperator = config.commands.trigger;
const mockRivescriptCommand = `${mockRivescriptCommandOperator}${config.separators.command}${mockWord}`;
const mockRivescriptLine = `${mockRivescriptCommand}${config.separators.line}`;

const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// getRedirectCommandFromText
test('getRedirectCommandFromText should return formatRivescriptLine with response command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const redirectCommand = config.commands.redirect;

  const result = rivescriptHelper.getRedirectCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(redirectCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// getResponseCommandFromText
test('getResponseCommandFromText should return formatRivescriptLine with response command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const responseCommand = config.commands.response;

  const result = rivescriptHelper.getResponseCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(responseCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// getTriggerCommandFromText
test('getTriggerCommandFromText should return formatRivescriptLine with trigger command and text', () => {
  sandbox.stub(rivescriptHelper, 'formatRivescriptLine')
    .returns(mockRivescriptLine);
  const triggerCommand = config.commands.trigger;

  const result = rivescriptHelper.getTriggerCommandFromText(mockWord);
  rivescriptHelper.formatRivescriptLine.should.have.been.calledWith(triggerCommand, mockWord);
  result.should.equal(mockRivescriptLine);
});

// formatRivescriptLine
test('formatRivescriptLine should return a trimmed concat of operator and value args', () => {
  const result = rivescriptHelper.formatRivescriptLine(mockRivescriptCommandOperator, `${mockWord}   `);
  result.should.equal(mockRivescriptLine);
});
