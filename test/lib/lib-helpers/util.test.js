'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');
// const helpers = require('../../../lib/helpers');
const stubs = require('../../helpers/stubs');

chai.should();
chai.use(sinonChai);
const expect = chai.expect;

// module to be tested
const utilHelper = require('../../../lib/helpers/util');

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
test('formatMobileNumber should throw an UnprocessibleEntityError if no mobile is passed for formatting', () => {
  expect(utilHelper.formatMobileNumber).to.throw(UnprocessibleEntityError);
});

test('formatMobileNumber should throw an UnprocessibleEntityError if the mobile is passed is not a valid US, E164 formatted mobile number', () => {
  const mobile = stubs.getMobileNumber();
  expect(() => utilHelper.formatMobileNumber(mobile)).to.throw(UnprocessibleEntityError);
});
