# Broadcast Settings

```
GET /api/v1/broadcast-settings/<broadcastId>
```
Returns the settings necessary to setup a Customer.io Triggered Campaign **after** the broadcast is created in Contentful.

## Authentication

The endpoint expects you to use [Basic Auth](../authentication.md). Example url using the browser: `http://protectedName:protectedPass@localhost:5100/api/v1/broadcast-settings/100`


## Inputs

Param | Description
--- | ---
`userPhoneField=<any valid US number>` | Overrides the `To` property with the passed `userPhoneField` in the `webhook.To` settings property.  

## Examples


<details>
<summary><strong>Example Request</strong></summary>

GET settings for the broadcastId: `tacosfest`.

```
curl -X "GET" "http://localhost:5100/api/v1/broadcast-settings/tacosfest" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "broadcast": {
    "broadcastId": "tacosfest",
    "message": "hola, you are invited to the best tacos festival in the whole world.",
    "declinedMessage": "nope"
  },
  "campaign": {
    "campaignId": "48"
  },
  "webhook": {
    "url": "http://<secret>:<secret>@blink-staging.dosomething.org/api/v1/webhooks/customerio-sms-broadcast",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "To": "{{customer.phone}}",
      "Body": "hola, you are invited to the best tacos festival in the whole world.",
      "StatusCallback": "http://<secret>:<secret>@blink-staging.dosomething.org/api/v1/webhooks/customerio-sms-broadcast?broadcastId=tacosfest"
    }
  },
  "statusCallbackUrl": "http://<secret>:<secret>@blink-staging.dosomething.org/api/v1/webhooks/customerio-sms-broadcast?broadcastId=tacosfest"
}
```
</details>

## Troubleshooting

Error | Meaning
--- | ---
Cannot GET `/api/v1/broadcast-settings` | Missing broadcastId in the URL
Broadcast **X** not found. | broadcastId was not found in Contentful. Is it published?
Broadcast misconfigured. Message is required! | Broadcast `message` field is empty in Contentful. Is this an old broadcast? Customer.io broadcasts expect the copy to exist in Contentful.
