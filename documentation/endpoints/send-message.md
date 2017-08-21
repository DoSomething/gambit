# Send Message

```
POST /api/v1/send-message
```
Sends a message to User. 

## Input

Name | Type | Description
--- | --- | ---
`phone` | `string` | Phone number of User to send outbound message to
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
  "template": "externalSignupMenuMessage"
}'
```

</details>


<details>
<summary><strong>Example Response</strong></summary>

```
{
  "reply": {
    "__v": 0,
    "updatedAt": "2017-08-18T19:36:31.664Z",
    "createdAt": "2017-08-18T19:36:31.664Z",
    "userId": "+15555550750",
    "campaignId": 48,
    "topic": "campaign",
    "conversation": "59972fac96c01d1d6b86c73c",
    "text": "Hey - this is Freddie from DoSomething. Thanks for joining Pride Over Prejudice!\n\nA new White House executive order denies all new refugees entry to the US for 120 days and places a 90-day travel ban on six Muslim-majority nations.\n\nThe solution is simple: Post a selfie to stand in solidarity with refugees and immigrants.\n\nMake sure to take a photo of what you did! When you have Shared some Pictures, text START to share your photo.",
    "template": "externalSignupMenuMessage",
    "direction": "outbound-api-send",
    "_id": "599741bf9f03df1f2c0cb5fb",
    "attachments": []
  }
}
```

</details>
