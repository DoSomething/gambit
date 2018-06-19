'use strict';

module.exports = {
  subscriptionStatuses: {
    active: 'active',
    less: 'less',
    // TODO: Set to 'pending' once available as an option.
    // @see https://www.pivotaltracker.com/n/projects/2019429/stories/158439520
    pending: 'unknown',
    stop: 'stop',
    undeliverable: 'undeliverable',
  },
};
