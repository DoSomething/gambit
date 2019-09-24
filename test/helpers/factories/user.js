'use strict';

const Chance = require('chance');
const ObjectID = require('mongoose').Types.ObjectId;
const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/user');

const userFields = config.fields;
const chance = new Chance();

module.exports.getValidUser = function getValidUser(phoneNumber = stubs.getMobileNumber(), smsStatus = 'active') {
  const user = {
    id: new ObjectID().toString(),
    mobile: phoneNumber,
    sms_status: smsStatus,
    sms_paused: false,
  };
  user[userFields.votingPlanAttendingWith.name] = chance.syllable();
  user[userFields.votingPlanMethodOfTransport.name] = chance.syllable();
  user[userFields.votingPlanTimeOfDay.name] = chance.syllable();
  return user;
};

module.exports.getValidUserWithAddress = function getValidUserWithAddress(phoneNumber) {
  const user = exports.getValidUser(phoneNumber);
  user.country = 'US';
  user.addr_city = chance.city();
  user.addr_state = chance.state({ country: 'us' });
  user.addr_zip = chance.zip();
  user.addr_source = 'sms';
  return user;
};
