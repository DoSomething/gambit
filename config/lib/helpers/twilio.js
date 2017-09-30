'use strict';

const configVars = {};
configVars.accountSid = process.env.TWILIO_ACCOUNT_SID || 'totallysecret';
configVars.messageServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || 'totallysecret';

// Blink related
configVars.blink = {};
/**
 * Our current smsBroadcastWebhook is setup in Blink
 *
 * Blink requires Basic Auth but it may not need it in the future.
 * This can be easily managed without additional code by adding/removing
 * the name:pass@ to the URL set in the .env file directly.
 */
configVars.blink.smsBroadcastWebhookUrl = process.env.DS_BLINK_SMS_BROADCAST_WEBHOOK_URL || 'http://localhost:5050/api/v1';

// Twilio REST API related
configVars.api = {};
configVars.api.sid = process.env.TWILIO_BROADCASTS_REVOKABLE_API_SID || 'totallysecret';
configVars.api.secret = process.env.TWILIO_BROADCASTS_REVOKABLE_API_SECRET || 'totallysecret';
configVars.api.baseUri = process.env.TWILIO_API_BASEURI || 'https://fakeapi.com';
configVars.api.authBaseUri = `${configVars.api.baseUri.replace('//', `//${configVars.api.sid}:${configVars.api.secret}@`)}`;
configVars.api.messagesListResourceUri = `/2010-04-01/Accounts/${configVars.accountSid}/Messages.json`;
module.exports = configVars;
