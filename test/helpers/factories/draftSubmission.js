'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const DraftSubmission = require('../../../app/models/DraftSubmission');
const stubs = require('../stubs');

/**
 * @param {Object} values
 * @return {Object}
 */
function getRawDraftSubmissionData(values = {}) {
  const id = new ObjectID();
  return {
    id,
    _id: id,
    conversationId: new ObjectID(),
    platformUserId: stubs.getMobileNumber(),
    topicId: stubs.getContentfulId(),
    values,
  };
}

/**
 * @return {DraftSubmission}
 */
function getValidCompletePhotoPostDraftSubmission() {
  return DraftSubmission(getRawDraftSubmissionData({
    quantity: 4,
    url: 'http://placekitten.com/g/300/300',
    whyParticipated: stubs.getRandomMessageText(),
  }));
}

/**
 * @return {DraftSubmission}
 */
function getValidEmptyDraftSubmission() {
  return new DraftSubmission(getRawDraftSubmissionData());
}

module.exports = {
  getValidCompletePhotoPostDraftSubmission,
  getValidEmptyDraftSubmission,
};
