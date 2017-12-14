'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const logger = require('../../../lib/logger');
const stubs = require('../../helpers/stubs');
const userFactory = require('../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const mustache = require('mustache');

const config = require('../../../config/lib/helpers/tags');

// module to be tested
const tagsHelper = require('../../../lib/helpers/tags');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockText = stubs.getMessageText();
const mockUser = userFactory.getValidUser();
const mockVars = { season: 'winter' };

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  t.context.req = httpMocks.createRequest();
});

// Cleanup
test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

test('render should return a string', () => {
  sandbox.stub(mustache, 'render')
    .returns(mockText);
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(mockVars);
  const result = tagsHelper.render(mockText, {});
  mustache.render.should.have.been.called;
  result.should.equal(mockText);
});

test('render should throw if mustache.render fails', () => {
  sandbox.stub(mustache, 'render')
    .returns(new Error());
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(mockVars);
  tagsHelper.render(mockText, mockVars).should.throw;
});

test('render should throw if getVarsForTags fails', () => {
  sandbox.stub(tagsHelper, 'getVarsForTags')
    .returns(new Error());
  tagsHelper.render(mockText, mockVars).should.throw;
});

test('getVarsForTags should return an object', () => {
  sandbox.stub(tagsHelper, 'getCustomUrl')
    .returns(mockText);
  const result = tagsHelper.getVarsForTags();
  result.should.be.a('object');
  result[config.tags.customUrl].should.equal(mockText);
});

test('getVarsForTags should throw if getCustomUrl fails', () => {
  sandbox.stub(tagsHelper, 'getCustomUrl')
    .returns(new Error());
  tagsHelper.getVarsForTags().should.throw;
});

test('getCustomUrl should return a string', () => {
  const mockString = 'cat=123&dog=456';
  sandbox.stub(tagsHelper, 'getCustomUrlQueryParamValue')
    .returns(mockString);
  const expected = `${config.customUrl.url}?${config.customUrl.queryParamName}=${mockString}`;
  const result = tagsHelper.getCustomUrl();
  result.should.equal(expected);
  tagsHelper.getCustomUrlQueryParamValue.should.have.been.called;
});

test('getCustomUrl should throw if getCustomUrlQueryParamValue fails', () => {
  sandbox.stub(tagsHelper, 'getCustomUrlQueryParamValue')
    .returns(new Error());
  tagsHelper.getCustomUrl().should.throw;
});

test('getCustomUrlQueryParamValue should call joinCustomUrlQueryValueFields', (t) => {
  const mockResult = 'success';
  sandbox.stub(tagsHelper, 'getUserIdCustomUrlQueryValueField')
    .returns('success1');
  sandbox.stub(tagsHelper, 'getCampaignRunIdCustomUrlQueryValueField')
    .returns('success2');
  sandbox.stub(tagsHelper, 'joinCustomUrlQueryValueFields')
    .returns(mockResult);
  const result = tagsHelper.getCustomUrlQueryParamValue(t.context.req);
  tagsHelper.getUserIdCustomUrlQueryValueField.should.have.been.called;
  tagsHelper.getCampaignRunIdCustomUrlQueryValueField.should.have.been.called;
  tagsHelper.joinCustomUrlQueryValueFields.should.have.been.called;
  result.should.equal(mockResult);
});

test('formatCustomUrlQueryValueField should return a string', () => {
  const field = 'lastName';
  const value = 'snow';
  const suffix = config.customUrl.queryValue.fieldSuffix;
  const expected = `${field}${suffix}${value}`;
  const result = tagsHelper.formatCustomUrlQueryValueField(field, value);
  result.should.equal(expected);
});

test('joinCustomUrlQueryValueFields should return a string if passed an array', () => {
  const data = ['a', 'b', 'c'];
  const suffix = config.customUrl.queryValue.separator;
  const expected = data.join(suffix);
  const result = tagsHelper.joinCustomUrlQueryValueFields(data);
  result.should.equal(expected);
});

test('joinCustomUrlQueryValueFields should throws if no value is passed', (t) => {
  t.throws(() => tagsHelper.joinCustomUrlQueryValueFields().should.equal(''));
});

test('getUserIdCustomUrlQueryValueField should return string for req.user', (t) => {
  t.context.req.user = mockUser;
  const fieldName = config.customUrl.queryValue.fields.userId;
  const result = tagsHelper.getUserIdCustomUrlQueryValueField(t.context.req);
  t.truthy(result.includes(fieldName));
  t.truthy(result.includes(mockUser.id));
});

test('getUserIdCustomUrlQueryValueField throws if req.user undefined', (t) => {
  t.throws(() => tagsHelper.getUserIdCustomUrlQueryValueField(t.context.req));
});
