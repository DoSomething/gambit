'use strict';

const userConfig = require('./user');

const userFields = userConfig.fields;

const pollingLocatorQuery = {
  source: 'sms',
  utm_campaign: 'sms_gotv',
  utm_medium: 'sms',
  utm_source: 'dosomething',
};

const votingPlanVarsByFieldValue = {
  attendingWith: {},
  methodOfTransport: {},
  timeOfDay: {},
};

const votingPlanAttendingWithValues = userFields.votingPlanAttendingWith.values;
Object.keys(votingPlanAttendingWithValues).forEach((attendingWithName) => {
  const fieldValue = votingPlanAttendingWithValues[attendingWithName];
  if (fieldValue === votingPlanAttendingWithValues.alone) {
    votingPlanVarsByFieldValue.attendingWith[fieldValue] = 'by yourself';
  } else if (fieldValue === votingPlanAttendingWithValues.coWorkers) {
    votingPlanVarsByFieldValue.attendingWith[fieldValue] = 'with co-workers';
  } else {
    votingPlanVarsByFieldValue.attendingWith[fieldValue] = `with ${fieldValue}`;
  }
});

const votingPlanMethodOfTransportValues = userFields.votingPlanMethodOfTransport.values;
Object.keys(votingPlanMethodOfTransportValues).forEach((methodOfTransportName) => {
  const fieldValue = votingPlanMethodOfTransportValues[methodOfTransportName];
  if (fieldValue === votingPlanMethodOfTransportValues.publicTransport) {
    votingPlanVarsByFieldValue.methodOfTransport[fieldValue] = 'take public transit';
  } else {
    votingPlanVarsByFieldValue.methodOfTransport[fieldValue] = fieldValue;
  }
});

Object.keys(userFields.votingPlanTimeOfDay.values).forEach((timeOfDayName) => {
  votingPlanVarsByFieldValue.timeOfDay[timeOfDayName] = timeOfDayName;
});

module.exports = {
  links: {
    pollingLocator: {
      find: {
        url: process.env.DS_GAMBIT_CONVERSATIONS_POLLING_LOCATOR_FIND_URL || 'https://www.dosomething.org/us/polling-locator-2018',
        query: pollingLocatorQuery,
      },
      share: {
        url: process.env.DS_GAMBIT_CONVERSATIONS_POLLING_LOCATOR_SHARE_URL || 'https://www.dosomething.org/us/campaigns/find-your-v-spot/blocks/5WuCqMMGre02mq8MqK4co6',
        query: pollingLocatorQuery,
      },
    },
  },
  user: {
    votingPlan: {
      template: '{{methodOfTransport}} in the {{timeOfDay}} {{attendingWith}}',
      vars: votingPlanVarsByFieldValue,
    },
  },
};
