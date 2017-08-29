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
`platformUserId` | `string` | If passed, the Conversation.platform is set to `'api'`.
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
  "messages": {
    "inbound": {
      "__v": 0,
      "updatedAt": "2017-08-29T05:11:02.980Z",
      "createdAt": "2017-08-29T05:11:02.980Z",
      "conversationId": "59a4f7669ea1a81cf1ac566f",
      "topic": "random",
      "text": "uhh",
      "direction": "inbound",
      "_id": "59a4f7669ea1a81cf1ac5670",
      "attachments": [
        {
          "contentType": "image/png",
          "url": "http://placekitten.com/g/800/800"
        }
      ]
    },
    "reply": {
      "__v": 0,
      "updatedAt": "2017-08-29T05:11:02.993Z",
      "createdAt": "2017-08-29T05:11:02.993Z",
      "conversationId": "59a4f7669ea1a81cf1ac566f",
      "topic": "random",
      "text": "Sorry, I'm not sure how to respond to that.\n\nSay MENU to find a Campaign to join.",
      "template": "noCampaignMessage",
      "direction": "outbound-reply",
      "_id": "59a4f7669ea1a81cf1ac5671",
      "attachments": []
    }
  }
}
```
