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

// getMacro
test('getMacro should return config for given macro if defined', () => {
  const macro = config.macros.subscriptionStatusStop;
  const result = macroHelper.getMacro(macro.name);
  result.should.deep.equal(macro);
});

test('getMacro should return falsy for undefined macro', (t) => {
  t.falsy(macroHelper.getMacro(undefinedMacroName));
});

// getProfileUpdate
test('getProfileUpdate should return config.updatesByMacro if exists for macro', () => {
  const lessMacro = config.macros.subscriptionStatusLess;
  const result = macroHelper.getProfileUpdate(lessMacro.name);
  result[lessMacro.profileUpdate.field].should.equal(lessMacro.profileUpdate.value);
});

test('getProfileUpdate should return empty object if config.updatesByMacro undefined', () => {
  const result = macroHelper.getProfileUpdate(stubs.getRandomMessageText());
  result.should.deep.equal({});
});

// isCompletedVotingPlan
test('isCompletedVotingPlan should return boolean', (t) => {
  t.true(macroHelper.isCompletedVotingPlan(macros.votingPlanAttendingWithFamily.name));
  t.true(macroHelper.isCompletedVotingPlan(macros.votingPlanAttendingWithFriends.name));
  t.falsy(macroHelper.isCompletedVotingPlan(macros.votingPlanTimeOfDayMorning.name));
  t.falsy(macroHelper.isCompletedVotingPlan(undefinedMacroName));
});

// isInvalidVotingPlanStatus
test('isInvalidVotingPlanStatus should return boolean', (t) => {
  t.true(macroHelper.isInvalidVotingPlanStatus(macros.invalidVotingPlanStatus.name));
  t.falsy(macroHelper.isInvalidVotingPlanStatus(undefinedMacroName));
});

// isMacro
test('isMacro returns whether text exists for given macro', (t) => {
  const macro = config.macros.subscriptionStatusStop;
  t.truthy(macroHelper.isMacro(macro.name));
  t.falsy(macroHelper.isMacro(undefinedMacroName));
});

// macros
test('macro.macros.x() should be equal to macro.macroNameValues.x', () => {
  macroHelper.macros.votingPlanStatusVoting()
    .should.be.equal(config.macros.votingPlanStatusVoting.name);
  macroHelper.macros.saidNo().should.be.equal(config.macros.saidNo.name);
  macroHelper.macros.saidYes().should.be.equal(config.macros.saidYes.name);
});

test('isSaidYes should return boolean', (t) => {
  t.true(macroHelper.isSaidYes(macros.saidYes.name));
  t.falsy(macroHelper.isSaidYes(undefinedMacroName));
});

test('isSaidNo should return boolean', (t) => {
  t.true(macroHelper.isSaidNo(macros.saidNo.name));
  t.falsy(macroHelper.isSaidNo(undefinedMacroName));
});

// isVotingPlanStatusVoting
test('isVotingPlanStatusVoting should return boolean', (t) => {
  t.falsy(macroHelper.isVotingPlanStatusVoting(null));
  t.true(macroHelper.isVotingPlanStatusVoting(macros.votingPlanStatusVoting.name));
  t.falsy(macroHelper.isVotingPlanStatusVoting(undefinedMacroName));
});
