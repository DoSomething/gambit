'use strict';

const ObjectID = require('mongoose').Types.ObjectId;
const DraftSubmission = require('../../../app/models/DraftSubmission');
const stubs = require('../stubs');

const photoPostValues = {
  quantity: 4,
  // @see https://github.com/DoSomething/rogue/blob/master/docs/endpoints/posts.md#create-a-post
  url: 'https://placekitten.com/g/400/400',
  whyParticipated: stubs.getRandomMessageText(),
};

/**
 * @param {Object} values
 * @return {Object}
 */
function getRawDraftSubmissionData(values = {}, conversationId, topicId) {
  const id = new ObjectID();
  return {
    id,
    _id: id,
    conversationId: conversationId || new ObjectID(),
    platformUserId: stubs.getMobileNumber(),
    topicId: topicId || stubs.getContentfulId(),
    values,
  };
}

/**
 * @return {DraftSubmission}
 */
function getValidCompletePhotoPostDraftSubmission(conversationId, topicId) {
  return DraftSubmission(
    getRawDraftSubmissionData(photoPostValues, conversationId, topicId),
  );
}

/**
 * @return {DraftSubmission}
 */
function getValidNewDraftSubmission(values = {}, conversationId, topicId) {
  return new DraftSubmission(
    getRawDraftSubmissionData(values, conversationId, topicId),
  );
}

module.exports = {
  getValidCompletePhotoPostDraftSubmission,
  getValidNewDraftSubmission,
};
