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
const config = require('../../../config/lib/helpers/template');

const undefinedTemplateName = 'oathKeeper';

// module to be tested
const templateHelper = require('../../../lib/helpers/template');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('getTextForTemplate should return text for given template', () => {
  const template = 'badWords';
  const templateText = config.conversationsTemplatesText[template];
  const result = templateHelper.getTextForTemplate(template);
  templateText.should.equal(result);
});

test('getTextForTemplate should return falsy for undefined template', (t) => {
  t.falsy(templateHelper.getTextForTemplate(undefinedTemplateName));
});

test('isAskContinueTemplate should return boolean', (t) => {
  t.true(templateHelper.isAskContinueTemplate('askContinue'));
  t.falsy(templateHelper.isAskContinueTemplate(undefinedTemplateName));
});

test('isAskSignupTemplate should return boolean', (t) => {
  t.true(templateHelper.isAskSignupTemplate('askSignup'));
  t.falsy(templateHelper.isAskSignupTemplate(undefinedTemplateName));
});

test('isGambitCampaignsTemplate should return boolean', (t) => {
  t.true(templateHelper.isGambitCampaignsTemplate('askQuantity'));
  t.falsy(templateHelper.isGambitCampaignsTemplate(undefinedTemplateName));
});
