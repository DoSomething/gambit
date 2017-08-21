# Import Message

```
POST /api/v1/import-message
```

Outbound communication may happen on a different channel. This endpoint allows us to import and save this message as part of the user's conversation.

## Input

### Customer.io
It's the only supported importer at this time.

Name | Type | Description
--- | --- | ---
`phone` | `string` | User's phone number
`broadcast_id` | `string` | Broadcast Id associated to this imported message (Contentful broadcast id)
`fields` | `Array` | Array of field objects. Each field object's value is used to interpolate placeholders in the copy of the message stored in contentful.

## Examples

### Request
Example of an inbound POST request from a Customer.io webhook.

```
curl -X "POST" "http://localhost:5100/api/v1/import-message?platform=customerio" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ=" \
     -H "Content-Type: application/json" \
     -d '{ "broadcast_id" : "7zU0Mb1k9GkWWI40o06Mic", "phone": "+5555555555", "fields": [{"customer.first_name": "taco"}]}'
```

### Created message

```
{
  "_id": ObjectId("599afa3cf446e81659550cbc"),
  "updatedAt": ISODate("2017-08-21T15:20:28.949Z"),
  "createdAt": ISODate("2017-08-21T15:20:28.949Z"),
  "userId": "+5555555555",
  "campaignId": 819,
  "topic": "campaign",
  "conversation": ObjectId("5994caf4a92890fa8a52de72"),
  "text": "Do you like tacos taco? Want to sign up for mirror messages?  taco is your name right?",
  "template": "askSignupMessage",
  "direction": "outbound-api-import",
  "attachments": [ ],
  "__v": 0
}
```

### Response

```
{
    "message": "OK"
}
```
