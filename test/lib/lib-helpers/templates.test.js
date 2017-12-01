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

test('getTextForTemplate should return null if template not found', (t) => {
  const template = 'alwaysPaysHisDebts';
  const result = templatesHelper.getTextForTemplate(template);
  t.falsy(result);
});

