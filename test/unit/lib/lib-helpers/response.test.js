'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');

chai.should();
chai.use(sinonChai);

// module to be tested
const responseHelper = require('../../../../lib/helpers/response');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  t.context.res = httpMocks.createResponse();
  sandbox.spy(t.context.res, 'send');
  sandbox.spy(t.context.res, 'status');
});

test.afterEach(() => {
  sandbox.restore();
});

// sendData
test('sendData calls send with an object and data property', (t) => {
  const data = ['Hello'];
  responseHelper.sendData(t.context.res, data);
  t.context.res.send.should.have.been.calledWith({ data });
});

// sendNoContent
test('sendNoContent calls status with 204 and send with string property', (t) => {
  const message = 'Hello';
  responseHelper.sendNoContent(t.context.res, message);
  t.context.res.status.should.have.been.calledWith(204);
  t.context.res.send.should.have.been.calledWith(message);
});
