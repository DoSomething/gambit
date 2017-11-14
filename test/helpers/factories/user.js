'use strict';

const ObjectID = require('mongoose').Types.ObjectId;

const stubs = require('../stubs');

module.exports.getValidUser = function getValidUser(phoneNumber) {
  return {
    id: new ObjectID(),
    mobile: phoneNumber || stubs.getMobileNumber(),
    sms_status: 'active',
  };
};
