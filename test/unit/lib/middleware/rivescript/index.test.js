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

test('getRivescript should call loadBot with true if cache query is set to false', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(deparsedRivescript);
  t.context.req.query = { cache: 'false' };

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.loadBot.should.have.been.calledWith(true);
  t.context.res.send.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript should call loadBot if bot is not ready', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(false);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(deparsedRivescript);

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.loadBot.should.have.been.called;
  t.context.res.send.should.have.been.called;
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript should call loadBot if Rivescript is not current', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(true);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'isRivescriptCurrent')
    .returns(false);
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(deparsedRivescript);

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.loadBot.should.have.been.called;
  helpers.rivescript.getDeparsedRivescript.should.have.been.called;
  t.context.res.send.should.have.been.calledWith({ data: deparsedRivescript });
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript does not call loadBot if bot is ready, Rivescript is current, and cache param is not set to false', async (t) => {
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(true);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.resolve());
  sandbox.stub(helpers.rivescript, 'isRivescriptCurrent')
    .returns(true);
  sandbox.stub(helpers.rivescript, 'getDeparsedRivescript')
    .returns(deparsedRivescript);

  // test
  await middleware(t.context.req, t.context.res);

  helpers.rivescript.loadBot.should.not.have.been.called;
  helpers.rivescript.getDeparsedRivescript.should.have.been.called;
  t.context.res.send.should.have.been.calledWith({ data: deparsedRivescript });
  helpers.sendErrorResponse.should.not.have.been.called;
});

test('getRivescript should send error upon helpers.rivescript.loadBot fail', async (t) => {
  const error = new Error({ message: 'Epic fail' });
  const middleware = getRivescript();
  sandbox.stub(helpers.rivescript, 'isBotReady')
    .returns(false);
  sandbox.stub(helpers.rivescript, 'loadBot')
    .returns(Promise.reject(error));

  // test
  await middleware(t.context.req, t.context.res);

  t.context.res.send.should.not.have.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
