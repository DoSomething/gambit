'use strict';

const profile = require('./user').fields;
const rivescriptTopics = require('./topic').rivescriptTopics;

const defaultTopic = rivescriptTopics.default;
const invalidAnswerText = 'Sorry, I didn\'t get that.';

// Subscription status.
const activeSubscriptionStatusText = process.env.DS_GAMBIT_CONVERSATIONS_SUBSCRIPTION_STATUS_ACTIVE_TEXT || 'Hi I\'m Tej from DoSomething.org! Welcome to my weekly updates (up to 8msg/month). Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.';
const lessSubscriptionStatusText = 'Great, you\'ll start to receive 1 monthly update from Tej at DoSomething.org! Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.';
const stopSubscriptionStatusText = process.env.DS_GAMBIT_CONVERSATIONS_SUBSCRIPTION_STATUS_STOP_TEXT || "You're unsubscribed from DoSomething.org Alerts. No more msgs will be sent. Text JOIN to receive 4-8 msgs/mth.\n\nLeave your feedback: https://dosomething.typeform.com/to/DHWcen?user_id={{user.id}}";

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

/**
 * Macros are configured with the following properties:
 * name - Matches the Rivescript reply text used to execute the macro
 * text - If set, the outbound message text (may be defined/overridden on a topic)
 * topic - If set, the topic to change conversation topic to
 * profileUpdate - If set, the field name and value to update a user with
 */
module.exports = {
  completedVotingPlanMacro,
  macros: {
    askVotingPlanStatus: {
      name: 'askVotingPlanStatus',
      text: askVotingPlanStatusText,
      topic: rivescriptTopics.askVotingPlanStatus,
    },
    catchAll: {
      name: 'catchAll',
    },
    invalidAskMultipleChoiceResponse: {
      name: 'invalidAskMultipleChoiceResponse',
    },
    invalidAskVotingPlanStatusResponse: {
      name: 'invalidAskVotingPlanStatusResponse',
      text: `${invalidAnswerText} ${askVotingPlanStatusText}`,
    },
    invalidVotingPlanAttendingWith: {
      name: 'invalidVotingPlanAttendingWith',
      text: `${invalidAnswerText} ${askVotingPlanAttendingWithText}`,
    },
    invalidVotingPlanMethodOfTransport: {
      name: 'invalidVotingPlanMethodOfTransport',
      text: `${invalidAnswerText} ${askVotingPlanMethodOfTransportText}`,
    },
    invalidVotingPlanTimeOfDay: {
      name: 'invalidVotingPlanTimeOfDay',
      text: `${invalidAnswerText} ${askVotingPlanTimeOfDayText}`,
    },
    noReply: {
      name: 'noReply',
      text: '',
    },
    saidFirstChoice: {
      name: 'saidFirstChoice',
    },
    saidSecondChoice: {
      name: 'saidSecondChoice',
    },
    saidThirdChoice: {
      name: 'saidThirdChoice',
    },
    saidFourthChoice: {
      name: 'saidFourthChoice',
    },
    saidFifthChoice: {
      name: 'saidFifthChoice',
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
      text: 'These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or https://dosome.click/2z6uc. Txt STOP to quit. Msg&Data Rates May Apply.',
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
      text: lessSubscriptionStatusText,
      topic: defaultTopic,
      profileUpdate: {
        field: profile.subscriptionStatus.name,
        value: profile.subscriptionStatus.values.less,
      },
    },
    subscriptionStatusNeedMoreInfo: {
      name: 'subscriptionStatusNeedMoreInfo',
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
      text: stopSubscriptionStatusText,
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
      name: 'votingPlanStatusVoted',
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
