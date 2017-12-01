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
const config = require('../../../config/lib/helpers/templates');

const undefinedTemplateName = 'oathKeeper';

// module to be tested
const templatesHelper = require('../../../lib/helpers/templates');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('getTextForTemplate should return text for given template', () => {
  const template = 'badWords';
  const templateText = config.templateText[template];
  const result = templatesHelper.getTextForTemplate(template);
  templateText.should.equal(result);
});

test('getTextForTemplate should return falsy for undefined template', (t) => {
  t.falsy(templatesHelper.getTextForTemplate(undefinedTemplateName));
});

test('isAskContinueTemplate should return boolean', (t) => {
  t.true(templatesHelper.isAskContinueTemplate('askContinue'));
  t.falsy(templatesHelper.isAskContinueTemplate(undefinedTemplateName));
});

test('isAskSignupTemplate should return boolean', (t) => {
  t.true(templatesHelper.isAskSignupTemplate('askSignup'));
  t.falsy(templatesHelper.isAskSignupTemplate(undefinedTemplateName));
});

test('isGambitCampaignsTemplate should return boolean', (t) => {
  t.true(templatesHelper.isGambitCampaignsTemplate('askQuantity'));
  t.falsy(templatesHelper.isGambitCampaignsTemplate(undefinedTemplateName));
});
