'use strict';

require('dotenv').config();

const bot = require('./lib/rivescript');
const Slack = require('@slack/client');  
var RtmClient = Slack.RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = Slack.RTM_EVENTS;

var bot_token = process.env.SLACK_BOT_TOKEN || '';
 
var rtm = new RtmClient(bot_token);
 
let channel;
 
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload 
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(rtmStartData.channels);
  for (const c of rtmStartData.channels) {
    if (c.is_member) { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
 
// you need to wait for the client to fully connect before you can send messages 
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//  console.log(channel);
});
 
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  // Only respond to private messages.
  if (message.channel[0] !== "D") return;

  bot.getReplyForUserMessage('localuser', message.text)
    .then((reply) => {
      rtm.sendMessage(reply, message.channel); 
    })
    .catch(err => console.log(err));
});
