'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const InternalServerError = require('../../app/exceptions/InternalServerError');
const UnprocessibleEntityError = require('../../app/exceptions/UnprocessibleEntityError.js');

chai.should();
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

// Module to test
const helpers = require('../../lib/helpers');

const analyticsHelper = helpers.analytics;

test.afterEach(() => {
  // reset stubs, spies, and mocks
  sandbox.restore();
});

// Tests

// sendErrorResponse

test('helpers.sendErrorResponse(res, anyString): should respond with error status 500 and anyString\'s value as message', () => {
  const res = httpMocks.createResponse();
  const errorString = 'omgError';
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(true);

  helpers.sendErrorResponse(res, errorString);

  const callArgs = helpers.sendResponseWithStatusCode.getCall(0).args;
  helpers.sendResponseWithStatusCode.should.have.been.called;
  callArgs[1].should.be.equal(500);
  callArgs[2].should.be.equal(errorString);
});

test('helpers.sendErrorResponse(res, error): should respond with error status and error message', () => {
  const res = httpMocks.createResponse();
  const genericError = new UnprocessibleEntityError();
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(true);

  helpers.sendErrorResponse(res, genericError);

  const callArgs = helpers.sendResponseWithStatusCode.getCall(0).args;
  helpers.sendResponseWithStatusCode.should.have.been.called;
  callArgs[1].should.be.equal(genericError.status);
  callArgs[2].should.be.equal(genericError.message);
});

test('helpers.sendErrorResponse(res): not sending an error should use a Generic Internal Server Error response', () => {
  const res = httpMocks.createResponse();
  const genericError = new InternalServerError();
  sandbox.stub(helpers, 'sendResponseWithStatusCode').returns(true);

  helpers.sendErrorResponse(res);

  const callArgs = helpers.sendResponseWithStatusCode.getCall(0).args;
  helpers.sendResponseWithStatusCode.should.have.been.called;
  callArgs[1].should.be.equal(genericError.status);
  callArgs[2].should.be.equal(genericError.message);
});

// sendResponseWithStatusCode
test('helpers.sendResponseWithStatusCode(res, code, msg): should call analyticsHelper.addParameters', () => {
  const res = httpMocks.createResponse();
  sandbox.stub(analyticsHelper, 'addParameters').returns(true);
  const message = 'Epic fail :-(';

  helpers.sendErrorResponse(res, 500, message);

  analyticsHelper.addParameters.should.have.been.called;
});
