'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const DraftSubmission = require('../../../app/models/DraftSubmission');
const stubs = require('../stubs');

const photoPostValues = {
  caption: stubs.getRandomMessageText(),
  quantitiy: 4,
  url: 'https://placekitten.com/g/300/300',
  whyParticipated: stubs.getRandomMessageText(),
};

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
  return DraftSubmission(getRawDraftSubmissionData(photoPostValues));
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
