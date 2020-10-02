'use strict';

const profile = require('./user').fields;
const rivescriptTopics = require('./topic').rivescriptTopics;

/**
 * These constants are used within multiple macros.
 */
const defaultTopic = rivescriptTopics.default;
const invalidAnswerText = 'Sorry, I didn\'t get that.';
// Subscription status confirmations.
const activeSubscriptionStatusText = '👋 Welcome to DoSomething.org! Meet the staffers who\'ll be texting you: https://www.dosomething.org/us/articles/meet-the-staff-sms?user_id={{user.id}}&utm_campaign=sms_compliance_message&utm_medium=sms&utm_source=content_fun\n\nMsg&DataRatesApply. Txt HELP for help, STOP to stop.';
const lessSubscriptionStatusText = 'Great, you\'ll start to receive 1 monthly update from DoSomething.org! Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.';
const stopSubscriptionStatusText = 'You\'re unsubscribed from DoSomething.org Alerts. No more msgs will be sent. Text JOIN to receive 4-8 msgs/mth.\n\nLeave your feedback: https://dosomething.typeform.com/to/DHWcen?user_id={{user.id}}';
// Prompt for voting method field value.
const askVotingMethodText =  'How do you plan on voting? A) In person B) Vote By Mail{{#user.earlyVotingStarts}} C) Early Voting{{/user.earlyVotingStarts}}';
// Prompt for voting plan field values.
const askVotingPlanAttendingWithText = 'Who are you planning on voting with? A) Alone B) Friends C) Family D) Co-workers';
const askVotingPlanMethodOfTransportText = 'How are you planning on getting to the polls? A) Drive B) Walk C) Bike D) Public transportation';
const askVotingPlanStatusText = 'Are you planning on voting? A) Yes B) No C) Already voted D) Can\'t vote';
const askVotingPlanTimeOfDayText = 'What time are you planning on voting? A) Morning B) Afternoon C) Evening';

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
    text: 'Thanks for making a plan! I\'ll remind you on Election Day to make sure you\'re ready to vote.',
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
 *
 * name - Matches the Rivescript reply text used to execute the macro
 * text - (optional) the reply message to send. If not defined, set via GraphQL.
 * topic - (optional) new conversation topic. If not defined, set via GraphQL (or no topic change).
 * profileUpdate - (optional) field name and value to update a user with.
 */
module.exports = {
  completedVotingPlanMacro: 'votingPlanAttendingWith',
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
    invalidVotingMethod: {
      name: 'invalidVotingMethod',
      text: `${invalidAnswerText} ${askVotingMethodText}`,
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
    votingMethodEarly: {
      name: 'votingMethodEarly',
      text: 'In {{user.addrState}}, early voting takes place between {{user.earlyVotingStarts}} and {{user.earlyVotingEnds}}. Find your polling place: https://www.vote.org/polling-place-locator',
      topic: defaultTopic,
      profileUpdate: {
        field: profile.votingMethod.name,
        value: profile.votingMethod.values.early,
      },
    },
    votingMethodInPerson: {
      name: 'votingMethodInPerson',
      text: `Let's make a simple plan for how you'll vote (and we'll remind you on Election Day!) ${askVotingPlanTimeOfDayText}`,
      topic: rivescriptTopics.askVotingPlanTimeOfDay,
      profileUpdate: {
        field: profile.votingMethod.name,
        value: profile.votingMethod.values.inPerson,
      },
    },
    votingMethodMail: {
      name: 'votingMethodMail',
      text: 'In {{user.addrState}}, your ballot must be {{user.absenteeBallotReturnDeadlineType}} {{user.absenteeBallotRequestDeadline}}. Take 2 mins to request your ballot: https://vote-absentee.com/?utm_source=DST\n\nThen, use this tool to learn about your balllot: https://www.ballotready.org',
      topic: defaultTopic,
      profileUpdate: {
        field: profile.votingMethod.name,
        value: profile.votingMethod.values.mail,
      },
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
      text: askVotingMethodText,
      topic: rivescriptTopics.askVotingMethod,
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
