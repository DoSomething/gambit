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
const mustache = require('mustache');

// const config = require('../../../config/lib/helpers/tags');

const mockText = 'Testing 123';
const mockVars = { season: 'winter' };

// module to be tested
const tagsHelper = require('../../../lib/helpers/tags');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('render should return a string', () => {
  sandbox.stub(mustache, 'render')
    .returns(mockText);
  sandbox.stub(tagsHelper, 'getVars')
    .returns(mockVars);
  const result = tagsHelper.render(mockText, {});
  mustache.render.should.have.been.called;
  result.should.equal(mockText);
});

test('render should throw if mustache.render fails', () => {
  sandbox.stub(mustache, 'render')
    .returns(new Error());
  tagsHelper.render(mockText, mockVars).should.throw;
});

test('render should throw if getVars fails', () => {
  sandbox.stub(tagsHelper, 'getVars')
    .returns(new Error());
  tagsHelper.render(mockText, mockVars).should.throw;
});
