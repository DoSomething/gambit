'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const UnprocessableEntityError = require('../../../app/exceptions/UnprocessableEntityError');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// App modules
const analyticsHelper = require('../../../lib/helpers').analytics;
const logger = require('../../../lib/logger');

// Module to test
const helpers = require('../../../lib/helpers');

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// Tests

// sendErrorResponse
test('helpers.sendErrorResponse(res, error): should respond with error status and error message', () => {
  const res = httpMocks.createResponse();
  const error = new UnprocessableEntityError();
  sandbox.stub(helpers.util, 'parseStatusAndMessageFromError')
    .returns({ status: error.status, message: error.message });
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(true);

  helpers.sendErrorResponse(res, error);

  const callArgs = helpers.sendResponseWithStatusCode.getCall(0).args;
  helpers.util.parseStatusAndMessageFromError.should.have.been.called;
  helpers.sendResponseWithStatusCode.should.have.been.called;
  callArgs[1].should.be.equal(error.status);
  callArgs[2].should.be.equal(error.message);
});

// sendResponseWithStatusCode
test('helpers.sendResponseWithStatusCode(res, code, msg): should call res.status and res.send', () => {
  const res = httpMocks.createResponse();
  sandbox.spy(res, 'status');
  sandbox.spy(res, 'send');
  sandbox.stub(analyticsHelper, 'addCustomAttributes').returns(true);
  const statusCode = 501;
  const message = 'Epic fail :-(';

  helpers.sendResponseWithStatusCode(res, statusCode, message);
  res.status.should.have.been.called;
  res.send.should.have.been.called;
  res.statusCode.should.be.equal(statusCode);
  const body = res._getData(); // eslint-disable-line no-underscore-dangle
  body.message.should.be.equal(message);
  analyticsHelper.addCustomAttributes.should.have.been.called;
});

test('helpers.sendResponseWithStatusCode(res, code, msg): should call logger.error for errors', () => {
  const res = httpMocks.createResponse();
  sandbox.stub(logger, 'debug').returns(true);
  sandbox.stub(logger, 'error').returns(true);
  sandbox.stub(analyticsHelper, 'addCustomAttributes').returns(true);
  const statusCode = 501;
  const message = 'Oh noes another epic fail D:';

  helpers.sendResponseWithStatusCode(res, statusCode, message);
  logger.debug.should.not.have.been.called;
  logger.error.should.have.been.called;
});

test('helpers.sendResponseWithStatusCode(res, code, msg): should call logger.debug if success', () => {
  const res = httpMocks.createResponse();
  sandbox.stub(logger, 'debug').returns(true);
  sandbox.stub(logger, 'error').returns(true);
  sandbox.stub(analyticsHelper, 'addCustomAttributes').returns(true);
  const statusCode = 201;
  const message = 'Great job';

  helpers.sendResponseWithStatusCode(res, statusCode, message);
  logger.error.should.not.have.been.called;
  logger.debug.should.have.been.called;
});
