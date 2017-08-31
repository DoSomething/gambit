# Import Message

```
POST /api/v1/import-message
```

Outbound communication may happen on a different channel. This endpoint allows us to import and save this message as part of the user's conversation.

## Input

### Customer.io
It's the only supported importer at this time. See [Broadcast Process Wiki](https://github.com/DoSomething/gambit-conversations/wiki/Broadcasts-Process)

Name | Type | Description
--- | --- | ---
`phone` | `string` | User's phone number
`broadcast_id` | `string` | Broadcast Id associated to this imported message (Contentful broadcast id)
`fields` | `Array` | Array of field objects. Each field object's value is used to interpolate placeholders in the copy of the message stored in contentful.

## Examples


<details>
<summary><strong>Example Request</strong></summary>

Example of an inbound POST request from a Customer.io webhook.

```
curl -X "POST" "http://localhost:5100/api/v1/import-message?platform=customerio" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ=" \
     -H "Content-Type: application/json" \
     -d '{ "broadcast_id" : "7zU0Mb1k9GkWWI40o06Mic", "phone": "+5555555555", "fields": [{"customer.first_name": "taco"}]}'
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
        "text": "Heya, taco! Down to complete today's action?",
        "template": "askSignupMessage",
        "direction": "outbound-api-import",
        "_id": "59a863a25e5d960956ffcc46",
        "attachments": []
      }
    ]
  }
}
```
</details>

