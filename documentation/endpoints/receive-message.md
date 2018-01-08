# Receive Message

```
POST /api/v1/receive-message
```

Receives a message and sends a reply (or forwards it, when appropriate).


## Input

### Twilio

Inbound Twilio messages sent to our shortcode are posted to this endpoint, passing a Twilio message:

Name | Type | Description
--- | --- | ---
`From` | `string` | Sender's phone number
`Body` | `string` | Incoming message
`MediaUrl0` | `string` | Incoming message attachment URL
`MediaContentType0` | `string` | Incoming message attachment type
`FromCity` | `string` |
`FromState` | `string` |
`FromZip` | `string` |
`FromCountry`| `string` |

### Slack

Direct messages sent to our DoSomething `@gambit-staging` Slack app are posted to this endpoint, passing parameters:

Name | Type | Description
--- | --- | ---
`slackId` | `string` | Sender's Slack User ID
`slackChannel` | `string` |  Direct message channel from Slack User to Gambit Slack app
`text` | `string` | Incoming message
`mediaUrl` | `string` | Media attachment URL (hardcoded to an image set in Gambit Slack).


### Consolebot

The Gambit shell script posts to this endpoint, passing parameters:

Name | Type | Description
--- | --- | ---
`mobile` | `string` | Sender's mobile number (`DS_CONSOLEBOT_MOBILE`).
`text` | `string` | Incoming message
`mediaUrl` | `string` | Media attachment URL (`DS_CONSOLEBOT_PHOTO_URL`).

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v1/receive-message" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "MessageSid": "MM09a8f657567f807443191c1e7exxxxxx",
  "MediaUrl0": "http://bit.ly/2wkfrep",
  "From":  "+5555555555",
  "Body": "uhh",
  "MediaContentType0": "image/png"
}'

```

</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": {
      "inbound": [
        {
          "__v": 0,
          "updatedAt": "2017-08-31T19:21:47.556Z",
          "createdAt": "2017-08-31T19:21:47.556Z",
          "conversationId": "59a7203fc731160d31cfdad2",
          "campaignId": 2710,
          "topic": "campaign",
          "text": "menu",
          "direction": "inbound",
          "_id": "59a861cbf64c3e0902d956e7",
          "attachments": [
            {
              "contentType": "image/png",
              "url": "http://placekitten.com/g/800/600"
            }
          ]
        }
      ],
      "outbound": [
        {
          "__v": 0,
          "updatedAt": "2017-08-31T19:21:47.597Z",
          "createdAt": "2017-08-31T19:21:47.597Z",
          "conversationId": "59a7203fc731160d31cfdad2",
          "campaignId": 7656,
          "topic": "campaign_7656",
          "text": "Help us send letters of support to every mosque in the United States. \n\nWant to join Sincerely, Us?\n\nYes or No",
          "template": "askSignupMessage",
          "direction": "outbound-reply",
          "_id": "59a861cbf64c3e0902d956e8",
          "attachments": []
        }
      ]
    }
  }
}
```
