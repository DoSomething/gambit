# Send Message

```
POST /api/v1/send-message
```
Sends either a Support or Campaign outbound message in a Conversation.

## Support

Sending Support messages requires a `x-front-signature` header. See [Support wiki](https://github.com/DoSomething/gambit-conversations/wiki/Support). 

## Campaign

Sends an outbound Campaign message for a given `campaignId` and message `template`, and updates the Conversation accordingly.

Supported templates:

* `externalSignupMenuMessage` -- Used to send SMS confirmation messages for web signups.

### Input

Name | Type | Description
--- | --- | ---
`mobile` | `string` | Mobile number of User to send outbound message to
`slackId` | `string` | Slack Id of User to send outbound message to
`campaignId` | `number` | Campaign Id of outbound message
`template` | `string` | Campaign message template to send

<details>
<summary><strong>Example Response</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v1/send-message" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "phone": "+15555550750",
  "campaignId": "48",
  "template": "externalSignupMenu"
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
        "__v": 0,
        "updatedAt": "2017-08-31T19:07:02.312Z",
        "createdAt": "2017-08-31T19:07:02.312Z",
        "conversationId": "59a5c175717a2f25fc628811",
        "campaignId": 7,
        "topic": "campaign",
        "text": "Hey - this is Freddie from DoSomething. Thanks for joining a movement to spread positivity in school. You can do something simple to make a big impact for a stranger.\n\nLet's do this: post encouraging notes in places that can trigger low self-esteem, like school bathrooms.\n\nThen, text START to share a photo of the messages you posted (and you'll be entered to win a $1000 scholarship)!",
        "template": "externalSignupMenuMessage",
        "direction": "outbound-api-send",
        "_id": "59a85e56d975b4080974ab2d",
        "attachments": []
      }
    ]
  }
}
```

</details>
