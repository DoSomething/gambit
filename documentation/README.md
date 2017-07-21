## Chatbot

```
POST /api/v1/receive-message
```

Receives a message and sends a reply (or forwards it, when appropriate). 


## Input


Name | Type | Description
--- | --- | ---
`phone` | `string` | 
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

```
{
  "reply": {
    "template": "brain",
    "text": "Hi, you're chatting with Slothie again. I'm a bot!"
  }
}
```
```
{
  "reply": {
    "template": "noReply",
    "text": ""
  }
}
```
```
{
  "reply": {
    "template": "error",
    "text": "Cannot read property '_id' of null"
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


