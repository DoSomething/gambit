'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const config = require('../../../../config/lib/helpers/macro');
const stubs = require('../../../helpers/stubs');

const macros = config.macros;
const topicId = stubs.getTopicId();
const changeTopicMacroName = `${config.macros.changeTopic.name}{topic=${topicId}}`;
const undefinedMacroName = 'trialByCombat';

// module to be tested
const macroHelper = require('../../../../lib/helpers/macro');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// getReplyText
test('getReplyText should return text for given macro if defined', () => {
  const macro = config.macros.subscriptionStatusStop;
  const result = macroHelper.getReplyText(macro.name);
  result.should.equal(macro.text);
});

test('getReply should return falsy for undefined macro reply', (t) => {
  t.falsy(macroHelper.getReplyText(undefinedMacroName));
});

// getChangeTopicMacroFromTopicI
test('getChangeTopicMacroFromTopicId returns string with changeTopicMacro prefix and topicId', () => {
  const result = macroHelper.getChangeTopicMacroFromTopicId(topicId);
  result.should.equal(changeTopicMacroName);
});

// isChangeTopic
test('isChangeTopic should return boolean', (t) => {
  t.true(macroHelper.isChangeTopic(macros.changeTopic.name));
  t.falsy(macroHelper.isChangeTopic(undefinedMacroName));
});

// isMacro
test('isMacro returns whether text exists for given macro', (t) => {
  const macro = config.macros.subscriptionStatusStop;
  t.truthy(macroHelper.isMacro(macro.name));
  t.falsy(macroHelper.isMacro(undefinedMacroName));
});

// TODO: Fix me
// test('macro.macros.x() should be equal to macro.macroNameValues.x', () => {
//   Object.keys(config.macros).forEach((macroConfig) => {
//     const macroName = macroConfig.name;
//     macroHelper.macros[macroName]().should.be.equal(macroName);
//   });
// });

test('isSaidYes should return boolean', (t) => {
  t.true(macroHelper.isSaidYes(macros.saidYes.name));
  t.falsy(macroHelper.isSaidYes(undefinedMacroName));
});

test('isSaidNo should return boolean', (t) => {
  t.true(macroHelper.isSaidNo(macros.saidNo.name));
  t.falsy(macroHelper.isSaidNo(undefinedMacroName));
});

test('isSupportRequested should return boolean', (t) => {
  t.true(macroHelper.isSupportRequested(macros.supportRequested.name));
  t.falsy(macroHelper.isSupportRequested(undefinedMacroName));
});
