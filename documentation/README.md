## Chatbot

```
POST /api/v1/chatbot
```


## Input


Name | Type | Description
--- | --- | ---
`userId` | `string` | User ID
`text` | `string` | Incoming message sent from User.
`platform` | `string` | e.g. `twilio`, `slack`

## Examples

### Request

```
curl -X "POST" "http://localhost:5100/v1/chatbot" \
     -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
     --data-urlencode "userId=123" \
     --data-urlencode "text=I can haz thumb socks?" \
     --data-urlencode "platform=curl" 
```

### Response

```
{
  "reply": {
    "type": "brain",
    "text": "Hi, you're chatting with Slothie again. I'm a bot!"
  }
}
```
```
{
  "reply": {
    "type": "noReply",
    "text": ""
  }
}
```
```
{
  "reply": {
    "type": "error",
    "text": "Cannot read property '_id' of null"
  }
}


```

## Users


```
GET /api/v1/users
```


## Messages

```
GET /api/v1/messages
```


## Actions

```
GET /api/v1/actions
```

## Usage

See https://florianholzapfel.github.io/express-restify-mongoose/ for docs on how to query the Users, Messages, and Actions endpoints.

### Examples

Filter
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={%22platform%22:%22slack%22}
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={"date":{"$gt":"2017-06-24T00:34:11.114Z"}}
Sort
* https://gambit-conversations-prod.herokuapp.com/api/v1/actions?sort=-date


