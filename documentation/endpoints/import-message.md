# Import Message

```
POST /api/v1/import-message
```

Outbound communication may happen on a different channel. This endpoint allows us to import and save this message as part of the user's conversation.

## Input

### Twilio's `statusCallback` webhook
It's the only supported importer at this time. See [Broadcast Process Wiki](https://github.com/DoSomething/gambit-conversations/wiki/Broadcasts-Process)

Name | Type | Description
--- | --- | ---
`To` | `string` | The phone number of the recipient.
`From` | `string` | The phone number that sent this message.
`Body` | `string` | The text body of the message. Up to 1600 characters long.
`MessageStatus` | `string` | The status of the message. Message delivery information is reflected in message status. The possible values are listed in the [Message resource](https://www.twilio.com/docs/api/messaging/message#message-status-values).
`MessageSid` | `string` | A 34 character unique identifier for the message.
`ApiVersion` | `string` | Current API version.

>[Twilio standard request parameters](https://www.twilio.com/docs/api/twiml/sms/twilio_request#request-parameters).

## Examples


<details>
<summary><strong>Example Request</strong></summary>

Inbound POST request from Twilio's `statusCallback` webhook.

```
curl -X "POST" "http://localhost:5100/api/v1/import-message?broadcastId=7zU0Mb1k9GkWWI40o06Mic" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ=" \
     -H "Content-Type: application/json" \
     -d '{ "To" : "+5551234567", "Body": "Boost a stranger''s self-esteem with just a sticky note! \n\nWant to join Mirror Messages?\n\nYes or No", "MessageStatus": "delivered", "MessageSid": "SMXXX"}'
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```

  "data": {
    "messages": [
      {
        "__v": 0,
        "updatedAt": "2017-08-31T19:29:38.689Z",
        "createdAt": "2017-08-31T19:29:38.689Z",
        "conversationId": "59a863a25e5v860956ffcc45",
        "campaignId": 7,
        "topic": "campaign",
        "text": "Boost a stranger's self-esteem with just a sticky note! \n\nWant to join Mirror Messages?\n\nYes or No",
        "template": "askSignup",
        "direction": "outbound-api-import",
        "_id": "59a863a25e5d960956ffcc46",
        "broadcastId": "7zU0Mb1k9GkWWI40o06Mic",
        "platformMessageId": "SMXXX",
        "metadata": {
		        "requestId": "5a2153c4-2c96-4061-a7fc-a7459bb81d58"
		    },
        "attachments": []
      }
    ]
  }
}
```
</details>
