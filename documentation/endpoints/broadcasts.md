# Broadcasts

```
GET /api/v1/broadcasts/:broadcastId
```
Returns the settings necessary to setup a Customer.io Triggered Campaign **after** the broadcast is created in Contentful.

## Authentication

The endpoint expects you to use [Basic Auth](../authentication.md). Example url using the browser: `http://protectedName:protectedPass@localhost:5100/api/v1/broadcasts/4kBM6LBfCowMmKKuqwwSUE`


## Inputs

Param | Description
--- | ---
`userPhoneField=<any valid US number>` | Overrides the `To` property with the passed `userPhoneField` in the `webhook.To` settings property.  

## Examples


<details>
<summary><strong>Example Request</strong></summary>

Get Broadcast with Contentful entry ID: `4kBM6LBfCowMmKKuqwwSUE`.

```
curl -X "GET" "http://localhost:5100/api/v1/broadcasts/4kBM6LBfCowMmKKuqwwSUE" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "id": "4kBM6LBfCowMmKKuqwwSUE",
    "name": "DefendDreamers_Nov9_GroupA",
    "createdAt": "2017-11-02T16:55:26.123Z",
    "updatedAt": "2017-11-02T16:55:26.123Z",
    "campaignId": "7927",
    "topic": "defenddreamers_nov9",
    "message": "It's Freddie again! It's inspiring to see thousands of DoSomething members pushing Congress to pass the DREAM Act, before they break for the holidays in mid-December! \n\nWe saw that there's misconceptions about actions you can take. Did you know even if you're under 18 you CAN call your congressperson? \n\nLet's build this movement together, take 2 mins to share this myth busting guide and encourage others to join the movement to protect young people. Click here to share: http://bit.ly/2yor7e7\n\nWant to keep calling? Click here: +1 202-851-9273",
    "stats": {
      "inbound": {
        "total": 320103
      },
      "outbound": {
        "total": 299112
      }
    },
    "webhook": {
      "url": "http://<secret>:<secret>@blink-staging.dosomething.org/api/v1/webhooks/twilio-sms-broadcast",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "To": "{{customer.phone}}",
        "Body": "It's Freddie again! It's inspiring to see thousands of DoSomething members pushing Congress to pass the DREAM Act, before they break for the holidays in mid-December! \n\nWe saw that there's misconceptions about actions you can take. Did you know even if you're under 18 you CAN call your congressperson? \n\nLet's build this movement together, take 2 mins to share this myth busting guide and encourage others to join the movement to protect young people. Click here to share: http://bit.ly/2yor7e7\n\nWant to keep calling? Click here: +1 202-851-9273",
        "StatusCallback": "http://<secret>:<secret>@blink-staging.dosomething.org/api/v1/webhooks/twilio-sms-broadcast?broadcastId=4kBM6LBfCowMmKKuqwwSUE"
      }
    }
  }
}
```
</details>

## Troubleshooting

Error | Meaning
--- | ---
Cannot GET `/api/v1/broadcasts` | Missing broadcastId in the URL
Broadcast **X** not found. | broadcastId was not found in Contentful. Is it published?
Broadcast misconfigured. Message is required! | Broadcast `message` field is empty in Contentful. Is this a pre-TGM/Conversations broadcast? Customer.io broadcasts expect the copy to exist in Contentful.
