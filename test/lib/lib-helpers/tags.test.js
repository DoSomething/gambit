'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const stubs = require('../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const mustache = require('mustache');

const config = require('../../../config/lib/helpers/tags');

const mockText = stubs.getMessageText();
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

test('getVars should return an object', () => {
  sandbox.stub(tagsHelper, 'getCustomUrl')
    .returns(mockText);
  const result = tagsHelper.getVars();
  result.should.be.a('object');
  result[config.tags.customUrl].should.equal(mockText);
});

test('getVars should throw if getCustomUrl fails', () => {
  sandbox.stub(tagsHelper, 'getCustomUrl')
    .returns(new Error());
  tagsHelper.getVars().should.throw;
});

test('getCustomUrl should return a string', () => {
  sandbox.stub(tagsHelper, 'getCustomUrlQueryParamValue')
    .returns(config.customUrl);
  const result = tagsHelper.getCustomUrl();

  result.should.be.a('string');
  tagsHelper.getCustomUrlQueryParamValue.should.have.been.called;
});

test('getCustomUrl should throw if getCustomUrlQueryValue fails', () => {
  sandbox.stub(tagsHelper, 'getCustomUrlQueryValue')
    .returns(new Error());
  tagsHelper.getCustomUrl().should.throw;
});

test('getCustomUrlQueryStringWithValue should return a string', () => {
  const value = 'test';
  const param = config.customUrl.queryParamName;
  const expected = `${param}=${value}`;
  const result = tagsHelper.getCustomUrlQueryStringWithValue(value);
  result.should.equal(expected);
});

test('customUrlQueryValueField should return a string', () => {
  const field = 'name';
  const value = 'snow';
  const suffix = config.customUrl.queryValue.fieldSuffix;
  const expected = `${field}${suffix}${value}`;
  const result = tagsHelper.customUrlQueryValueField(field, value);
  result.should.equal(expected);
});
