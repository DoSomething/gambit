## Authentication
The `receive-message`, `import-message`, and `send-message` routes are protected by Basic Auth. Requests should include an Authorization header.

#### Supplying basic auth headers [(Source)](https://developer.atlassian.com/cloud/jira/platform/jira-rest-api-basic-authentication/#supplying-basic-auth-headers)

##### Manually
To do this you need to perform the following steps:

- Build a string of the form `name:pass`
- Base64 encode the string
- Supply an “Authorization” header with content “Basic ” followed by the encoded string. For example, the string `fred:fred` encodes to `ZnJlZDpmcmVk` in base64, so you would make the request as follows.
```
curl -D -X POST -H "Authorization: Basic ZnJlZDpmcmVk" -H "Content-Type: application/json" "http://localhost:5100/api/v1/import-message"
```

##### As part of the URL (Especially helpful for webhooks)
Prepend the `name` and `pass` in the form `name:pass@` to the endpoint URL.
```
http://name:pass@localhost:5100/api/v1/import-message
```

## Receive Message

```
POST /api/v1/receive-message
```

Receives a message and sends a reply (or forwards it, when appropriate).


## Input


Name | Type | Description
--- | --- | ---
`From` | `string` | Sender's phone number (included when we receive a Twilio message)
`Body` | `string` | Incoming message (included when we receive a Twilio message)
`slackId` | `string` |
`slackChannel` | `string` |
`facebookId` | `string` |
`userId` | `string` | Northstar ID
`text` | `string` | Incoming message sent from User.
`mediaUrl` | `string` | Media attachment URL (currently only supports 1 attachment).

## Examples

### Request

```
curl -X "POST" "http://localhost:5100/api/v1/retrieve-message" \
     -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
     --data-urlencode "userId=123" \
     --data-urlencode "text=I can haz thumb socks?" \
```

### Response

Returns an Outbound Reply Message (when Conversation is not paused).


```
{
  "reply": {
    "__v": 0,
    "userId": "U1BBD0D4G",
    "topic": "random",
    "conversation": "5977aed9bb17210a72aad245",
    "text": "Sorry, I'm not sure how to respond to that.\n\nSay MENU to find a Campaign to join.",
    "template": "noCampaignMessage",
    "direction": "outbound-reply",
    "_id": "59776272230c54001125ef7c",
    "date": "2017-07-25T20:49:29.895Z"
  }
}
```

## Send Message

Sends a message to User.


```
POST /api/v1/send-message
```

## Conversations


```
GET /api/v1/conversations
```

## Messages

```
GET /api/v1/messages
```


## Query paramters

See https://florianholzapfel.github.io/express-restify-mongoose/ for the GET endpoints:

### Filtering
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={"platform":"slack"}
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={"date":{"$gt":"2017-06-24T00:34:11.114Z"}}

### Sort
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?sort=-date
