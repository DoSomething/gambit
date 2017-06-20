# API


```
POST /v1/chatbot
```


**Input**


Name | Type | Description
--- | --- | ---
`userId` | `string` | DS User ID
`message` | `string` | Incoming message sent from User.

<details><summary>**Example Request**</summary><p>

```
curl -X "POST" "http://localhost:5000/v1/chatbot" \
     -H "Content-Type: application/x-www-form-urlencoded; charset=utf-8" \
     --data-urlencode "userId=123" \
     --data-urlencode "message=Hi" \
```

</p></details>

<details><summary>**Example Response**</summary><p>

```
{
  "request": {
    "message": "hi"
  },
  "response": {
    "message": "hello",
    "user": {
      "_id": "12",
      "__v": 0,
      "dateLastMessageSent": "2017-06-20T04:45:00.861Z",
      "topic": "campaign",
      "campaignId": 1508,
      "signupStatus": "doing"
    }
  }
}
```

</p></details>
