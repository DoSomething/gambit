'use strict';

// libs
require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const logger = require('../../../../lib/logger');
const stubs = require('../../../helpers/stubs');
const campaignFactory = require('../../../helpers/factories/campaign');
const userFactory = require('../../../helpers/factories/user');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// app modules
const mustache = require('mustache');

const config = require('../../../../config/lib/helpers/tags');

// module to be tested
const tagsHelper = require('../../../../lib/helpers/tags');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

// stubs
const mockCampaign = campaignFactory.getValidCampaign();
const mockText = stubs.getRandomMessageText();
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

test('render should replace user vars', (t) => {
  t.context.req.user = mockUser;
  const result = tagsHelper.render('{{user.id}}', t.context.req);
  result.should.equal(mockUser.id);
});

test('getVarsForTags should return an object', (t) => {
  const result = tagsHelper.getVarsForTags(t.context.req);
  result.should.be.a('object');
  result.should.have.property('links');
  result.should.have.property('user');
});
