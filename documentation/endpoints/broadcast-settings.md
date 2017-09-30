# Broadcast Settings

```
GET /api/v1/broadcast-settings/<broadcastId>
```
Returns the settings necessary to setup a Customer.io Triggered Campaign **after** the broadcast is created in Contentful.

## Authentication

The endpoint expects you to use [Basic Auth](../authentication.md). Example url using the browser: `http://protectedName:protectedPass@localhost:5100/api/v1/broadcast-settings/100`

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
    "url": "https://SKXX:wtXX@api.twilio.com/2010-04-01/Accounts/ACXX/Messages.json",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "body": "To={{customer.phone}}&Body=hola, you are invited to the best tacos festival in the whole world.&MessagingServiceSid=MGXX&StatusCallback=https%3A%2F%2Fpuppet%3Atotallysecret%4057528dc6.ngrok.io%2Fapi%2Fv1%2Fimport-message%3FbroadcastId%3Dtacosfest"
  }
}
```
</details>

## Troubleshooting

Error | Meaning
--- | ---
Cannot GET `/api/v1/broadcast-settings` | Missing broadcastId in the URL
Broadcast **X** not found. | broadcastId was not found in Contentful. Is it published?
Broadcast misconfigured. Message is required! | Broadcast `message` field is empty in Contentful. Is this an old broadcast? Customer.io broadcasts expect the copy to exist in Contentful.
