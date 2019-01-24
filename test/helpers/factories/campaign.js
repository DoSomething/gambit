'use strict';

const stubs = require('../stubs');

/**
 * @return {Object}
 */
function getValidCampaign() {
  return {
    id: stubs.getRandomNumericId(),
    internalTitle: stubs.getRandomName(),
    endDate: null,
  };
}

/**
 * @return {Object}
 */
function getValidClosedCampaign() {
  return { ...module.exports.getValidCampaign(), endDate: '2018-07-19T00:00:00Z' };
}

module.exports = {
  getValidCampaign,
  getValidClosedCampaign,
};
