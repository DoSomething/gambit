'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const userFactory = require('../../helpers/factories/user');

chai.should();
chai.use(sinonChai);

// module to be tested
const userHelper = require('../../../lib/helpers/user');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// hasLocation
test('hasLocation should return true if user has location properties set', (t) => {
  const user = userFactory.getValidUserWithLocation();
  t.true(userHelper.hasLocation(user));
});

test('hasLocation should return false if user does not have location properties set', (t) => {
  const user = userFactory.getValidUser();
  t.falsy(userHelper.hasLocation(user));
});
