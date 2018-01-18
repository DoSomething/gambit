# Messages

```
POST /v2/messages
```

The v2 POST Messages resource is a work in progress, aiming to deprecate the v1 POST Receive, Import, and Send Message resources. A Message is created for each POST request, and handled differently per `origin` query parameter passed.

## Broadcast

```
POST /v2/messages?origin=broadcast
```

### Input

Name | Type | Description
--- | --- | ---
`mobile` | `string` | Mobile number of User to send broadcast message to
`broadcastId` | `string` | Broadcast message to send

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "POST" "http://localhost:5100/api/v2/messages" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -u 'puppet:totallysecret' \
     -d $'{
  "mobile": "+5555555555",
  "broadcastId": "5Akz30ejtKCsiWgwKIkOyo"
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
        "_id": "5a5e9bb842ced115e4dbfda4",
        "updatedAt": "2018-01-17T00:41:28.911Z",
        "createdAt": "2018-01-17T00:41:28.911Z",
        "text": "Hi it's Freddie! Want to know how you could enter for the chance to win a $5K scholarship by sharing one of your big regrets? It takes 2 mins! Reply Yes or No",
        "direction": "outbound-api-send",
        "template": "askSignup",
        "conversationId": "5a2c391d36515819a6446d6e",
        "campaignId": 7978,
        "topic": "campaign",
        "broadcastId": "5Akz30ejtKCsiWgwKIkOyo",
        "__v": 0,
        "metadata": {
          "requestId": "17b1ab02-205b-4728-b4c9-d778bf89f561"
        },
        "attachments": []
      }
    ]
  }
```

</details>
