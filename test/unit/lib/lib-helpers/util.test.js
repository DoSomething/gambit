'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const InternalServerError = require('../../../../app/exceptions/InternalServerError');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');
const stubs = require('../../../helpers/stubs');

chai.should();
chai.use(sinonChai);
const expect = chai.expect;

// module to be tested
const utilHelper = require('../../../../lib/helpers/util');

// sinon sandbox object
const sandbox = sinon.sandbox.create();

test.afterEach(() => {
  sandbox.restore();
});

// deepUpdateWithDotNotationParser
test('deepUpdateWithDotNotationParser should parse nested objects and return mongodb deep update compatible object', async () => {
  const sample1 = {
    prop1: 'prop1value',
    prop2: {
      nested1prop1: 'nested1prop1value',
    },
    prop3: [
      { hi: 'hi' },
      { bye: 'bye' },
    ],
  };
  const sample2 = {
    prop1: 'prop1value',
    prop2: {
      nested1prop1: {
        nested2prop1: {
          nested3prop1: {
            nested4prop1: 'nested4prop1value',
          },
        },
      },
    },
  };

  const parsedSample1 = await utilHelper.deepUpdateWithDotNotationParser(sample1);
  const parsedSample2 = await utilHelper.deepUpdateWithDotNotationParser(sample2);
  parsedSample1['prop2.nested1prop1'].should.be.eql('nested1prop1value');
  parsedSample1['prop3.1.bye'].should.be.eql('bye');
  parsedSample2['prop2.nested1prop1.nested2prop1.nested3prop1.nested4prop1']
    .should.be.eql('nested4prop1value');
});

// formatMobileNumber
test('formatMobileNumber should throw an UnprocessableEntityError if no mobile is passed for formatting', () => {
  expect(utilHelper.formatMobileNumber).to.throw(UnprocessableEntityError);
});

test('formatMobileNumber should throw an UnprocessableEntityError if the mobile is passed is not a valid US, E164 formatted mobile number', () => {
  const mobile = stubs.getMobileNumber();
  expect(() => utilHelper.formatMobileNumber(mobile)).to.throw(UnprocessableEntityError);
});

// parseStatusAndMessageFromError
test('parseStatusAndMessageFromError(anyString): should respond with error status 500 and anyString\'s value as message', () => {
  const errorString = 'omgError';

  // test
  const result = utilHelper.parseStatusAndMessageFromError(errorString);
  result.status.should.equal(500);
  result.message.should.equal(errorString);
});

test('parseStatusAndMessageFromError(error): should respond with error status and error message', () => {
  const unprocessableEntityError = new UnprocessableEntityError();

  // test
  const result = utilHelper.parseStatusAndMessageFromError(unprocessableEntityError);
  result.status.should.equal(unprocessableEntityError.status);
  result.message.should.equal(unprocessableEntityError.message);
});

test('parseStatusAndMessageFromError(): not sending an error should use a Generic Internal Server Error response', () => {
  const genericError = new InternalServerError();

  // test
  const result = utilHelper.parseStatusAndMessageFromError(genericError);
  result.status.should.equal(genericError.status);
  result.message.should.equal(genericError.message);
});

test('parseStatusAndMessageFromError(res) sets message to res.response.body.error.message if exists', () => {
  const res = httpMocks.createResponse();
  const message = 'API key invalid';
  res.status = 401;
  res.response = {
    body: {
      error: {
        message,
      },
    },
  };
  // test
  const result = utilHelper.parseStatusAndMessageFromError(res);
  result.status.should.equal(res.status);
  result.message.should.equal(message);
});

test('parseStatusAndMessageFromError(res) sets message to res.response.body.message if exists', () => {
  const res = httpMocks.createResponse();
  const message = 'API key invalid';
  res.status = 401;
  res.response = {
    body: {
      message,
    },
  };
  // test
  const result = utilHelper.parseStatusAndMessageFromError(res);
  result.status.should.equal(res.status);
  result.message.should.equal(message);
});

test('parseStatusAndMessageFromError(error) sets message to error.message if exists', () => {
  const error = {
    message: 'API key invalid',
  };
  // test
  const result = utilHelper.parseStatusAndMessageFromError(error);
  result.status.should.equal(500);
  result.message.should.equal(error.message);
});
