'use strict';

const configVars = {};
configVars.accountSid = process.env.TWILIO_ACCOUNT_SID || 'totallysecret';
configVars.messageServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || 'totallysecret';

/**
 * Test Credentials
 * @see https://www.twilio.com/docs/api/rest/test-credentials
 */
configVars.testAccountSid = process.env.TWILIO_TEST_ACCOUNT_SID || 'totallysecret';
configVars.testAuthToken = process.env.TWILIO_TEST_AUTH_TOKEN || 'totallysecret';

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
/**
 * Revokable API keys to be used with Customer.io Webhooks
 * @see https://www.twilio.com/console/sms/runtime/api-keys
 */
configVars.api.sid = process.env.TWILIO_BROADCASTS_REVOKABLE_API_SID || 'totallysecret';
configVars.api.secret = process.env.TWILIO_BROADCASTS_REVOKABLE_API_SECRET || 'totallysecret';
// Twilio's api base URI
configVars.api.baseUri = process.env.TWILIO_API_BASEURI || 'https://fakeapi.com';
configVars.api.authBaseUri = `${configVars.api.baseUri.replace('//', `//${configVars.api.sid}:${configVars.api.secret}@`)}`;
configVars.api.testAuthBaseUri = `${configVars.api.baseUri.replace('//', `//${configVars.testAccountSid}:${configVars.testAuthToken}@`)}`;
// Twilio's MessagesListResource URI
configVars.api.messagesListResourceUri = `/2010-04-01/Accounts/${configVars.accountSid}/Messages.json`;
configVars.api.testMessagesListResourceUri = `/2010-04-01/Accounts/${configVars.testAccountSid}/Messages.json`;
module.exports = configVars;
