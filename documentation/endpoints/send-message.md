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
`mobile` or `northstarId` | `string` | Mobile number or Northstar id of User to send outbound message to
`slackId` | `string` | Slack Id of User to send outbound message to
`campaignId` | `number` | Campaign Id of outbound message
`template` | `string` | Campaign message template to send

<details>
<summary><strong>Example Request using User's mobile phone</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v1/send-message" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "mobile": "+15555550750",
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
        "_id": "59d552716dc3ceaee1fbaf78",
        "updatedAt": "2017-10-04T21:28:17.472Z",
        "createdAt": "2017-10-04T21:28:17.472Z",
        "text": "Hey - this is Freddie from DoSomething. Thanks for joining Pride Over Prejudice!\n\nA new White House executive order denies all new refugees entry to the US for 120 days and places a 90-day travel ban on six Muslim-majority nations.\n\nThe solution is simple: Post a selfie to stand in solidarity with refugees and immigrants.\n\nMake sure to take a photo of what you did! When you have Shared some Pictures, text START to share your photo.",
        "direction": "outbound-api-send",
        "template": "externalSignupMenu",
        "conversationId": "59c41ce4675e5b3497f606c0",
        "campaignId": 48,
        "topic": "campaign",
        "broadcastId": null,
        "__v": 0,
        "attachments": []
      }
    ]
  }
}
```

</details>

<details>
<summary><strong>Example Request using User's Northstar id</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v1/send-message" \
     -H "Content-Type: application/json; charset=utf-8" \
     -u puppet:totallysecret \
     -d $'{
  "northstarId": "59c41ce4675e05b3497f606c0",
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
        "_id": "59d552716dc3ceaee1fbaf78",
        "updatedAt": "2017-10-04T21:28:17.472Z",
        "createdAt": "2017-10-04T21:28:17.472Z",
        "text": "Hey - this is Freddie from DoSomething. Thanks for joining Pride Over Prejudice!\n\nA new White House executive order denies all new refugees entry to the US for 120 days and places a 90-day travel ban on six Muslim-majority nations.\n\nThe solution is simple: Post a selfie to stand in solidarity with refugees and immigrants.\n\nMake sure to take a photo of what you did! When you have Shared some Pictures, text START to share your photo.",
        "direction": "outbound-api-send",
        "template": "externalSignupMenu",
        "conversationId": "59c41ce4675e5b3497f606c0",
        "campaignId": 48,
        "topic": "campaign",
        "broadcastId": null,
        "__v": 0,
        "attachments": []
      }
    ]
  }
}
```

</details>
