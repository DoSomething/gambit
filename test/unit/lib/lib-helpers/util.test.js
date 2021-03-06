'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

const superagent = require('superagent');
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

// containsAlphanumeric
test('containsAlphanumeric should return when alphanumeric, false if not', (t) => {
  t.truthy(utilHelper.containsAlphanumeric('Hey'));
  t.falsy(utilHelper.containsAlphanumeric('😎 😎'));
  t.truthy(utilHelper.containsAlphanumeric('This is neat 😎 😎'));
  t.truthy(utilHelper.containsAlphanumeric('1'));
  t.falsy(utilHelper.containsAlphanumeric('  '));
  t.falsy(utilHelper.containsAlphanumeric(null));
});

// containsAtLeastOneLetter
test('containsAtLeastOneLetter should return true when string has at least one letter', (t) => {
  t.truthy(utilHelper.containsAtLeastOneLetter('Hey'));
  t.falsy(utilHelper.containsAtLeastOneLetter('😎 😎'));
  t.truthy(utilHelper.containsAtLeastOneLetter('This is neat 😎 😎'));
  t.falsy(utilHelper.containsAtLeastOneLetter('1'));
  t.falsy(utilHelper.containsAtLeastOneLetter('  '));
  t.falsy(utilHelper.containsAtLeastOneLetter(null));
});

// isValidTextFieldValue
test('isValidTextFieldValue should return true if trimmed string arg has letters and length greater than 2', (t) => {
  t.truthy(utilHelper.isValidTextFieldValue('1 a'));
  t.falsy(utilHelper.isValidTextFieldValue('a'));
  t.falsy(utilHelper.isValidTextFieldValue('1231231'));
  t.falsy(utilHelper.isValidTextFieldValue());
  t.falsy(utilHelper.isValidTextFieldValue(null));
});

// fetchImageFileFromUrl
test('fetchImageFileFromUrl should return parsed response of superagent.get', async () => {
  const url = 'test';
  const mockFile = 'abc123';
  const mockResponse = { body: mockFile };
  sandbox.stub(superagent, 'get')
    .returns({
      buffer: sinon.stub().returns({
        parse: sinon.stub().returns(Promise.resolve(mockResponse)),
      }),
    });

  const result = await utilHelper.fetchImageFileFromUrl(url);
  superagent.get.should.have.been.calledWith(url);
  result.should.equal(mockFile);
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

test('truncateText should return a text truncated to the correct length', () => {
  // Rogue's limit
  const text = stubs.getLongString();
  const truncatedText = utilHelper.truncateText(text);
  truncatedText.length.should.be.equal(500);

  // other test case
  const otherText = stubs.getLongString();
  const otherTruncatedText = utilHelper.truncateText(otherText, { length: 100 });
  otherTruncatedText.length.should.be.equal(100);
});
