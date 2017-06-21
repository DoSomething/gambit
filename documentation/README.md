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
     --data-urlencode "message=I can haz thumb socks?" \
```

</p></details>

<details><summary>**Example Response**</summary><p>

```
{
  "reply": {
    "body": "You're signed up for Thumb Wars. #blessed"
  }
}
```

</p></details>
