# Receive Message

```
POST /api/v1/receive-message
```

Receives a message and sends a reply (or forwards it, when appropriate).


## Input

Name | Type | Description
--- | --- | ---
`From` | `string` | Sender's phone number (included in Twilio message)
`Body` | `string` | Incoming message (included in Twilio message)
`MediaUrl0` | `string` | Incoming message attachment URL (included in Twilio message)
`MediaContentType0` | `string` | Incoming message attachment type (included in Twilio message)
`slackId` | `string` |
`slackChannel` | `string` |
`facebookId` | `string` |
`mobile` | `string` | Mobile number for the User (passed for general API usage, e.g. Consolebot).
`text` | `string` | Incoming message sent from User.
`mediaUrl` | `string` | Media attachment URL (currently only supports 1 attachment).

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
