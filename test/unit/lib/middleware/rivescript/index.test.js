'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../lib/helpers');
const logger = require('../../../../../lib/logger');
const stubs = require('../../../../helpers/stubs');

chai.should();
chai.use(sinonChai);

// module to be tested
const getRivescript = require('../../../../../lib/middleware/rivescript/index');

const sandbox = sinon.sandbox.create();

const deparsedRivescript = { topics: { random: [] } };

test.beforeEach((t) => {
  stubs.stubLogger(sandbox, logger);
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
  sandbox.spy(t.context.res, 'send');
});

test.afterEach((t) => {
  // reset stubs, spies, and mocks
  sandbox.restore();
  t.context = {};
});

test('getRivescript should call helpers.rivescript.getDeparsedRivescript with true if cache query is set to false', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(Promise.resolve(deparsedRivescript));
  t.context.req.query = { cache: 'false' };

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.getDeparsedRivescript.should.have.been.calledWith(true);
  t.context.res.send.should.have.been.calledWith({ data: deparsedRivescript });
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript should call helpers.rivescript.getDeparsedRivescript with false if cache query is not', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(Promise.resolve(deparsedRivescript));

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.getDeparsedRivescript.should.have.been.calledWith(false);
  t.context.res.send.should.have.been.calledWith({ data: deparsedRivescript });
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript should return  helpers.rivescript.getDeparsedRivescript error upon fail', async (t) => {
  const error = new Error({ message: 'Epic fail' });
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.getDeparsedRivescript.should.have.been.called;
  t.context.res.send.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
