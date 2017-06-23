# API

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

## Example

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
    "text": "You're signed up for Thumb Wars. #blessed"
  }
}
```

### Users

```
GET /api/v1/users
```


### Messages

```
GET /api/v1/messages
```



### Actions

```
GET /api/v1/actions
```
