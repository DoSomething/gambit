'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const draftSubmissionSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  topicId: String,
  values: {
    type: Object,
    default: {},
  },
}, {
  collection: 'draftSubmissions',
  timestamps: true,
});

draftSubmissionSchema.index({
  conversationId: 1,
  topicId: 1,
}, {
  unique: true,
});

module.exports = mongoose.model('DraftSubmission', draftSubmissionSchema);
