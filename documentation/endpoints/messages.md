
# Messages

```
PATCH /v2/messages/:messageId
```

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "PATCH" "http://localhost:5100/api/v2/messages/5abe56bc2fe4f00004389028" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "metadata": {
    "delivery": {
      "deliveredAt": "2018-03-30T15:24:45.000Z"
    }
  }
}'
```

</details>

<details>
<summary><strong>Example Response</strong></summary>

204 No Content

</details>

---

```
POST /v2/messages
```

The v2 POST Messages resource requires an `origin` query parameter, with possible values:
* [Broadcast](#broadcast)
* [Front](#front)
* [Signup](#signup)
* [Subscription status active](#subscription-status-active)
* [Twilio](#twilio)
* [A custom messaging platform](#custom)

## Broadcast

```
POST /v2/messages?origin=broadcast
```

Sends a Broadcast message to a Member.

### Input

Name | Type | Description
--- | --- | ---
`userId` or `northstarId`** | `string` | User Id to send Broadcast message to
`broadcastId` | `string` | Broadcast Id to send
`platform` | `string` | Optional, defaults to `'sms'`.

> `northstarId` is deprecated but still accepted for backwards compatibility

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=broadcast" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "broadcastId": "4nwTwvXmfuuYAGYgusGyyW"
}'
```

</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "platformMessageId": "SM9f73c7a8d1fc444faeeec9964a270514",
        "_id": "5b7c9cea350595000404de44",
        "updatedAt": "2018-08-21T23:14:50.529Z",
        "createdAt": "2018-08-21T23:14:50.314Z",
        "text": "I don't want to wait, for our lives to be over",
        "direction": "outbound-api-send",
        "template": "autoReplyBroadcast",
        "conversationId": "5ac7a86b8c02c10004d92577",
        "campaignId": 8158,
        "topic": "61RPZx8atiGyeoeaqsckOE",
        "userId": "5547be89469c64ec7d8b518d",
        "broadcastId": "4nwTwvXmfuuYAGYgusGyyW",
        "__v": 0,
        "metadata": {
            "requestId": "e8cbf79d-6cd3-4028-b1aa-d8455c166d57",
            "delivery": {
                "totalSegments": 1,
                "queuedAt": "2018-08-21T23:14:50.000Z"
            }
        },
        "attachments": []
      }
    ]
  }
}
```

</details>

## Broadcast Lite

```
POST /v2/messages?origin=broadcastLite
```

Sends a Broadcast message to a Member. Uses properties cached values in Fastly and the member's `mobile` sent from C.io.

### Input

Name | Type | Description
--- | --- | ---
`userId` or `northstarId`** | `string` | User Id to send Broadcast message to
`broadcastId` | `string` | Broadcast Id to send
`mobile` | `string` | Member's mobile number in E164 format
`platform` | `string` | Optional, defaults to `'sms'`.

> `northstarId` is deprecated but still accepted for backwards compatibility

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=broadcastLite" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "broadcastId": "4nwTwvXmfuuYAGYgusGyyW",
  "mobile": "+15554443322"
}'
```

</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "platformMessageId": "SM9f73c7a8d1fc444faeeec9964a270514",
        "_id": "5b7c9cea350595000404de44",
        "updatedAt": "2018-08-21T23:14:50.529Z",
        "createdAt": "2018-08-21T23:14:50.314Z",
        "text": "I don't want to wait, for our lives to be over",
        "direction": "outbound-api-send",
        "template": "autoReplyBroadcast",
        "conversationId": "5ac7a86b8c02c10004d92577",
        "campaignId": 8158,
        "topic": "61RPZx8atiGyeoeaqsckOE",
        "userId": "5547be89469c64ec7d8b518d",
        "broadcastId": "4nwTwvXmfuuYAGYgusGyyW",
        "__v": 0,
        "metadata": {
            "requestId": "e8cbf79d-6cd3-4028-b1aa-d8455c166d57",
            "delivery": {
                "totalSegments": 1,
                "queuedAt": "2018-08-21T23:14:50.000Z"
            }
        },
        "attachments": []
      }
    ]
  }
}
```

</details>

## Front

```
POST /v2/messages?origin=front
```

Receives a Front message from an Agent to a member, and creates an outbound support message for the User Conversation.

* Unpauses the Conversation (if archived in Front).
* Sends the message to User if Conversation platform is SMS.

### Input

See https://dev.frontapp.com/#sending-messages.


<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=front" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -H 'X-Front-Signature: secretsauce' \
     -u 'puppet:totallysecret' \
     -d $'{
  "_links": {
    "self": "https://api2.frontapp.com/messages/msg_55c8c149",
    "related": {
      "conversation": "https://api2.frontapp.com/conversations/cnv_55c8c149",
      "message_replied_to": "https://api2.frontapp.com/messages/msg_1ab23cd4"
    }
  },
  "id": "msg_55c8c149",
  "type": "custom",
  "is_inbound": false,
  "created_at": 1453770984.123,
  "blurb": "Anything less than immortality is a...",
  "recipients": [
    {
      "handle": "calculon@momsbot.com",
      "role": "to",
      "_links": {
        "related": {
          "contact": "https://api2.frontapp.com/contacts/crd_55c8c149"
        }
      }
    },
    {
      "handle": "puppet@puppetsloth.com",
      "role": "from",
      "_links": {
        "related": {
          "contact": "https://api2.frontapp.com/contacts/crd_55c8c149"
        }
      }
    }
  ],
  "body": "Anything less than immortality is a complete waste of time.",
  "text": "Anything less than immortality is a complete waste of time.",
  "attachments": [],
  "metadata": {}
}'
```


</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "_id": "5a7b70f478225e00040c5f22",
        "updatedAt": "2018-02-07T21:34:44.382Z",
        "createdAt": "2018-02-07T21:34:44.382Z",
        "text": "Anything less than immortality is a complete waste of time.",
        "direction": "outbound-api-send",
        "template": "support",
        "conversationId": "59b0de57e9f1ae00126cd731",
        "campaignId": 2299,
        "agentId": "puppet@puppetsloth.com",
        "topic": "random",
        "broadcastId": null,
        "__v": 0,
        "metadata": {
          "requestId": "333d0a65-ee7a-4d62-b815-336495628bca"
        },
        "attachments": []
      }
    ]
  }
```

</details>


## Signup

```
POST /v2/messages?origin=signup
```

Creates an outbound Campaign Signup menu message in given User's Conversation.

* Sends the message if given platform is SMS.

### Input

Name | Type | Description
--- | --- | ---
`userId` or `northstarId`** | `string` | User Id to send externalSignupMenuMessage to
`campaignId` | `string` | Campaign Id to send externalSignupMenuMessage for
`platform` | `string` | Optional, defaults to `'sms'`.

> `northstarId` is deprecated but still accepted for backwards compatibility

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=signup" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "campaignId": "2299"
}'
```


</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "_id": "5a7b70f478225e00040c5f22",
        "updatedAt": "2018-02-07T21:34:44.382Z",
        "createdAt": "2018-02-07T21:34:44.382Z",
        "text": "Hey - this is Freddie from DoSomething. Thanks for joining Two Books Blue Books!\n\nIn some low-income neighborhoods, there is only one book for every 300 children.\n\nThe solution is simple: Host a Dr. Seuss book drive to benefit kids in family shelters.\n\nMake sure to take a photo of what you did! When you have Collected some Books, text START to share your photo.",
        "direction": "outbound-api-send",
        "template": "webStartPhotoPost",
        "conversationId": "59b0de57e9f1ae00126cd731",
        "campaignId": 2299,
        "topic": "campaign",
        "broadcastId": null,
        "__v": 0,
        "metadata": {
            "requestId": "333d0a65-ee7a-4d62-b815-336495628bca"
        },
        "attachments": []
      }
    ]
  }
```

</details>

## Subscription status active

```
POST /v2/messages?origin=subscriptionStatusActive
```

Creates an outbound `subscriptionStatusActive` (Welcome) message in given User's Conversation.

* Sends the message if given platform is SMS.

### Input

Name | Type | Description
--- | --- | ---
`userId` or `northstarId`** | `string` | User Id to send subscriptionStatusActive to
`platform` | `string` | Optional, defaults to `'sms'`.

> `northstarId` is deprecated but still accepted for backwards compatibility

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=subscriptionStatusActive" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
		  "northstarId": "5547be89429c64ec7e8b518d"
		}'
```


</details>
<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "messages": [
      {
        "platformMessageId": "SM319d272df2254594ad436ad5cb533f00",
        "_id": "5b46418c6564fbf804b9a33b",
        "updatedAt": "2018-07-11T17:42:37.072Z",
        "createdAt": "2018-07-11T17:42:36.685Z",
        "text": "Hi I'm Freddie from DoSomething.org! Welcome to my weekly updates (up to 8msg/month). Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.",
        "direction": "outbound-api-send",
        "template": "subscriptionStatusActive",
        "conversationId": "5b45024f6564fbf804b9a339",
        "topic": "random",
        "userId": "5547be89429c64ec7e8b518d",
        "broadcastId": null,
        "__v": 0,
        "metadata": {
          "requestId": "e2aa69d1-9980-4882-94d2-03c89944a663",
          "delivery": {
            "totalSegments": 1,
            "queuedAt": "2018-07-11T17:42:37.000Z"
          }
        },
        "attachments": []
      }
    ]
  }
}
```

</details>


## Twilio

```
POST /v2/messages?origin=twilio
```

Receives inbound SMS/MMS messages from Members, and sends replies back by posting to Twilio.

* Creates a new Northstar User if it doesn't exist for the sender.


### Input

See https://www.twilio.com/docs/api/messaging/message.

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=twilio" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "MessageSid": "MM09a8f657567f807443191c1e7exxxxxx",
  "MediaUrl0": "http://www.fillmurray.com/g/200/300",
  "From":  "+5555555555",
  "Body": "hi",
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
</details>

## Custom

```
POST /v2/messages?origin=:customPlatform
```

Receives inbound messages from Members via specified origin, and returns the replies.

### Input

Name | Type | Description
--- | --- | ---
`userId` or `northstarId`** | `string` | Sender's Northstar ID
`text` | `string` | Incoming message text
`mediaUrl` | `string` | Incoming message attachment URL
`messageId` | `string` | Optional. Incoming message ID (e.g. Slack message ID)

> `northstarId` is deprecated but still accepted for backwards compatibility

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=gambit-slack" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "northstarId": "5547be89429c64ec7e8b518d",
  "text": "menu"
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
          "updatedAt": "2017-09-31T19:21:47.556Z",
          "createdAt": "2017-09-31T19:21:47.556Z",
          "conversationId": "59a7asd03fc731160d31cfdad2",
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
          "updatedAt": "2017-09-31T19:21:47.597Z",
          "createdAt": "2017-09-31T19:21:47.597Z",
          "conversationId": "59a7asd03fc731160d31cfdad2",
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
</details>

## Twilio Studio

```
POST /v2/messages?origin=twilioStudio
```
 
 Receives an inbound Twilio message, and returns the corresponding Northstar user and Rivescript reply. This used by Twilio Functions via a Twilio Studio flow prototyping Gambit integration -- see [pull#404](https://github.com/DoSomething/gambit-conversations/pull/404)

* Creates a new Northstar User if it doesn't exist for the sender.

* Does not create any documents in the `messages` collection for now, as outbound messages are sent via the Twilio Studio flow that use the Functions that post here.

### Input

See https://www.twilio.com/docs/api/messaging/message.

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages?origin=twilioStudio" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "MessageSid": "MM09a8f657567f807443191c1e7exxxxxx",
  "MediaUrl0": "http://www.fillmurray.com/g/200/300",
  "From":  "+5555555555",
  "Body": "hi",
  "MediaContentType0": "image/png"
}'

```

</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "user": {
    "id": "5547be89469c64ec7d8b518d",
    ...
    "last_authenticated_at": "2018-09-07T20:01:28+00:00",
    "last_messaged_at": "2018-09-19T04:48:39+00:00",
    "updated_at": "2018-09-19T04:48:39+00:00",
    "created_at": "2013-01-23T02:47:30+00:00"
  },
  "reply": {
    "text": "Thanks for your interest in DoSomething Strategic's newsletter, 'Til Next Tuesday! Trust us, it's way less boring than the other ones you get. Text back your email to sign up now.",
    "match": "tmi",
    "topic": {
      "id": "tmi_level1",
      "type": "rivescript",
      "name": "tmi_level1"
    }
  }
}
```
</details>
