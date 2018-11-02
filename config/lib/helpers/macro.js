'use strict';

const profile = require('./user').fields;
const rivescriptTopics = require('./topic').rivescriptTopics;

const defaultTopic = rivescriptTopics.default;
const invalidAnswerText = 'Sorry, I didn\'t get that.';

// Subscription status.
const activeSubscriptionStatusText = 'Hi I\'m Freddie from DoSomething.org! Welcome to my weekly updates (up to 8msg/month). Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.';
const askSubscriptionStatusText = 'Do you want texts: A)Weekly B)Monthly C)I need more info';
const newsUrl = 'https://www.dosomething.org/us/spot-the-signs-guide?source=sms&utm_source=dosomething&utm_medium=sms&utm_campaign=permissioning_weekly&user_id={{user.id}}';

// Voting plan.
const askVotingPlanAttendingWithText = process.env.DS_GAMBIT_CONVERSATIONS_ASK_VOTING_PLAN_ATTENDING_WITH_TEXT || 'Who are you planning on voting with? A) Alone B) Friends C) Family D) Co-workers';
const askVotingPlanMethodOfTransportText = process.env.DS_GAMBIT_CONVERSATIONS_ASK_VOTING_PLAN_METHOD_OF_TRANSPORT_TEXT || 'How are you planning on getting to the polls? A) Drive B) Walk C) Bike D) Public transportation';
const askVotingPlanStatusText = process.env.DS_GAMBIT_CONVERSATIONS_ASK_VOTING_PLAN_STATUS_TEXT || 'Are you planning on voting? A) Yes B) No C) Already voted D) Can\'t vote';
const askVotingPlanTimeOfDayText = process.env.DS_GAMBIT_CONVERSATIONS_ASK_VOTING_PLAN_TIME_OF_DAY_TEXT || 'What time are you planning on voting? A) Morning B) Afternoon C) Evening';
// The votingPlanStatusVoting macro begins collecting voting plan data via topic changes:
// 1 - askVotingPlanTimeOfDay
// 2 - askVotingPlanMethodOfTransport
// 3 - askVotingPlanAttendingWith
// 4 - completed
const votingStatusVotingText = process.DS_GAMBIT_CONVERSATIONS_VOTING_STATUS_VOTING_TEXT || 'Awesome! First thing you\'ll need to do is find your polling place, so you know where you\'ll be voting. It takes less than a minute, check here: {{links.pollingLocator.find}}\n\nNow let\'s make a simple plan for how you\'ll vote (and we\'ll remind you on Election Day!).';
const beginVotingPlanText = `${votingStatusVotingText}\n\n${askVotingPlanTimeOfDayText}`;
const beginVotingPlanTopic = rivescriptTopics.askVotingPlanTimeOfDay;
const completedVotingPlanMacro = 'votingPlanAttendingWith';
const completedVotingPlanText = process.env.DS_GAMBIT_CONVERSATIONS_COMPLETED_VOTING_PLAN_TEXT || 'Thanks for making a plan! I\'ll remind you on Election Day to make sure you\'re ready to vote.\n\nCan\'t wait? Share this graphic to let people know you\'re voting: {{links.pollingLocator.share}}';

/**
 * @param {String} prefix
 * @param {String} valueKey
 * @return {String}
 */
function macroName(prefix, valueKey) {
  return `${prefix}${valueKey.charAt(0).toUpperCase() + valueKey.slice(1)}`;
}

/**
 * @param {String} string
 * @return {String}
 */
function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

/**
 * @param {String} valueKey
 * @return {Object}
 */
function votingPlanTimeOfDay(valueKey) {
  return {
    name: macroName('votingPlanTimeOfDay', valueKey),
    // After saving time of day, ask for method of transport.
    text: `Great! ${askVotingPlanMethodOfTransportText}`,
    topic: rivescriptTopics.askVotingPlanMethodOfTransport,
    profileUpdate: {
      field: profile.votingPlanTimeOfDay.name,
      value: profile.votingPlanTimeOfDay.values[valueKey],
    },
  };
}

/**
 * @param {String} valueKey
 * @return {Object}
 */
function votingPlanAttendingWith(valueKey) {
  return {
    name: macroName('votingPlanAttendingWith', valueKey),
    // After saving attending with, the voting plan is complete.
    text: completedVotingPlanText,
    topic: defaultTopic,
    profileUpdate: {
      field: profile.votingPlanAttendingWith.name,
      value: profile.votingPlanAttendingWith.values[valueKey],
    },
  };
}

/**
 * @param {String} valueKey
 * @return {Object}
 */
function votingPlanMethodOfTransport(valueKey) {
  return {
    name: macroName('votingPlanMethodOfTransport', valueKey),
    // After saving method of transport, ask for attending with.
    text: `And finally, ${lowercaseFirstLetter(askVotingPlanAttendingWithText)}`,
    topic: rivescriptTopics.askVotingPlanAttendingWith,
    profileUpdate: {
      field: profile.votingPlanMethodOfTransport.name,
      value: profile.votingPlanMethodOfTransport.values[valueKey],
    },
  };
}

module.exports = {
  completedVotingPlanMacro,
  // If a macro contains a text property, it's sent as the reply to the inbound message.
  // If it doesn't, the reply text is sourced from the current topic.
  macros: {
    askVotingPlanStatus: {
      name: 'askVotingPlanStatus',
      text: askVotingPlanStatusText,
      topic: rivescriptTopics.askVotingPlanStatus,
    },
    askSubscriptionStatus: {
      name: 'askSubscriptionStatus',
      text: askSubscriptionStatusText,
      topic: rivescriptTopics.askSubscriptionStatus,
    },
    catchAll: {
      name: 'catchAll',
    },
    invalidSubscriptionStatus: {
      name: 'invalidSubscriptionStatus',
      text: `${invalidAnswerText} ${askSubscriptionStatusText}`,
    },
    invalidVotingPlanAttendingWith: {
      name: 'invalidVotingPlanAttendingWith',
      text: `${invalidAnswerText} ${askVotingPlanAttendingWithText}`,
    },
    invalidVotingPlanMethodOfTransport: {
      name: 'invalidVotingPlanMethodOfTransport',
      text: `${invalidAnswerText} ${askVotingPlanMethodOfTransportText}`,
    },
    invalidVotingPlanStatus: {
      name: 'invalidVotingPlanStatus',
      text: `${invalidAnswerText} ${askVotingPlanStatusText}`,
    },
    invalidVotingPlanTimeOfDay: {
      name: 'invalidVotingPlanTimeOfDay',
      text: `${invalidAnswerText} ${askVotingPlanTimeOfDayText}`,
    },
    noReply: {
      name: 'noReply',
      text: '',
    },
    saidNo: {
      name: 'saidNo',
    },
    saidYes: {
      name: 'saidYes',
    },
    sendCrisisMessage: {
      name: 'sendCrisisMessage',
      text: 'Thanks for being brave and sharing that. If you want to talk to someone, our friends at CTL are here for you 24/7. Just send a text to 741741. They\'ll listen!',
    },
    sendInfoMessage: {
      name: 'sendInfoMessage',
      text: 'These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or http://doso.me/1jf4/291kep. Txt STOP to quit. Msg&Data Rates May Apply.',
    },
    subscriptionStatusActive: {
      name: 'subscriptionStatusActive',
      text: activeSubscriptionStatusText,
      topic: defaultTopic,
      profileUpdate: {
        field: profile.subscriptionStatus.name,
        value: profile.subscriptionStatus.values.active,
      },
    },
    subscriptionStatusLess: {
      name: 'subscriptionStatusLess',
      text: `Okay, great! I'll text you once a month with updates on what's happening in the news and/or easy ways for you to take action in your community! Wanna take 2 mins to learn how to spot the signs of an abusive relationship and what you can do about it? Read our guide here: ${newsUrl}`,
      topic: defaultTopic,
      profileUpdate: {
        field: profile.subscriptionStatus.name,
        value: profile.subscriptionStatus.values.less,
      },
    },
    subscriptionStatusNeedMoreInfo: {
      name: 'subscriptionStatusNeedMoreInfo',
      text: `Sure! Once a week, I text over 3 million young people with updates on what's happening in the news and/or easy ways to take action in your community.\n\nWant an example of an easy way to take action? Take 2 mins to learn how to spot the signs of an abusive relationship and what you can do about it. Read our guide: ${newsUrl}`,
    },
    subscriptionStatusResubscribed: {
      name: 'subscriptionStatusResubscribed',
      text: activeSubscriptionStatusText,
      topic: defaultTopic,
      profileUpdate: {
        field: profile.subscriptionStatus.name,
        value: profile.subscriptionStatus.values.active,
      },
    },
    subscriptionStatusStop: {
      name: 'subscriptionStatusStop',
      text: 'You\'re unsubscribed from DoSomething.org Alerts. No more msgs will be sent. Reply HELP for help. Text JOIN to receive 4-8 msgs/mth or LESS for 1msg/mth.',
      topic: rivescriptTopics.unsubscribed,
      profileUpdate: {
        field: profile.subscriptionStatus.name,
        value: profile.subscriptionStatus.values.stop,
      },
    },
    supportRequested: {
      name: 'supportRequested',
      text: 'What\'s your question? I\'ll try my best to answer it.',
      topic: rivescriptTopics.support,
    },
    votingPlanAttendingWithAlone: votingPlanAttendingWith('alone'),
    votingPlanAttendingWithCoWorkers: votingPlanAttendingWith('coWorkers'),
    votingPlanAttendingWithFamily: votingPlanAttendingWith('family'),
    votingPlanAttendingWithFriends: votingPlanAttendingWith('friends'),
    votingPlanMethodOfTransportBike: votingPlanMethodOfTransport('bike'),
    votingPlanMethodOfTransportDrive: votingPlanMethodOfTransport('drive'),
    votingPlanMethodOfTransportPublicTransport: votingPlanMethodOfTransport('publicTransport'),
    votingPlanMethodOfTransportWalk: votingPlanMethodOfTransport('walk'),
    votingPlanStatusCantVote: {
      name: 'votingPlanStatusCantVote',
      profileUpdate: {
        field: profile.votingPlanStatus.name,
        value: profile.votingPlanStatus.values.cantVote,
      },
    },
    votingPlanStatusNotVoting: {
      name: 'votingPlanStatusNotVoting',
      profileUpdate: {
        field: profile.votingPlanStatus.name,
        value: profile.votingPlanStatus.values.notVoting,
      },
    },
    votingPlanStatusVoted: {
      profileUpdate: {
        field: profile.votingPlanStatus.name,
        value: profile.votingPlanStatus.values.voted,
      },
    },
    votingPlanStatusVoting: {
      name: 'votingPlanStatusVoting',
      text: beginVotingPlanText,
      topic: beginVotingPlanTopic,
      profileUpdate: {
        field: profile.votingPlanStatus.name,
        value: profile.votingPlanStatus.values.voting,
      },
    },
    votingPlanTimeOfDayAfternoon: votingPlanTimeOfDay('afternoon'),
    votingPlanTimeOfDayEvening: votingPlanTimeOfDay('evening'),
    votingPlanTimeOfDayMorning: votingPlanTimeOfDay('morning'),
  },
};
