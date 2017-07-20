## Chatbot

```
POST /api/v1/chatbot
```
## Query Parameters

Name | Type | Description
--- | --- | ---
`platform` | `string` | e.g. `twilio`, `slack`

## Input


Name | Type | Description
--- | --- | ---
`userId` | `string` | User ID
`text` | `string` | Incoming message sent from User.
`mediaUrl` | `string` | Media attachment URL (currently only supports 1 attachment).

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
## Send Message

```
POST /api/v1/send-message
```

## Users


```
GET /api/v1/users
```

## Messages

```
GET /api/v1/messages
```


## Usage

See https://florianholzapfel.github.io/express-restify-mongoose/ for docs on how to query the Users,  and Messages endpoints.

### Examples

Filter
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={"platform":"slack"}
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?query={"date":{"$gt":"2017-06-24T00:34:11.114Z"}}
Sort
* https://gambit-conversations-prod.herokuapp.com/api/v1/messages?sort=-date


