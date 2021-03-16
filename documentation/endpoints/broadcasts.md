# Broadcasts

```
GET /api/v2/broadcasts/:broadcastId
```
Fetches a broadcast from GraphQL, and returns additional data properties for send configuration and message stats. 


## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "GET" "http://localhost:5100/api/v2/broadcasts/1S4pnWcZ3qeK0IyU6u4gYE" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "id": "257eBFFXnay6QoUOCuuiS0",
    "name": "GrabTheMic2018_Jul3_Pending_FINAL",
    "createdAt": "2018-07-04T13:24:32.793Z",
    "updatedAt": "2018-07-05T13:34:50.370Z",
    "message": {
      "text": "It's Tej, happy 5th of July! Even though the holiday's over, you can still enjoy this playlist we made you all summer. Enjoy: https://www.dosomething.org/us/fourth-of-july-playlist?user_id={{user.id}}&broadcastid=257eBFFXnay6QoUOCuuiS0",
      "attachments": [
        
      ],
      "template": "rivescript"
    },
    "campaignId": null,
    "topic": "survey_response",
    "webhook": {
      "headers": {
        "Content-Type": "application/json"
      },
      "url": "http://<secret>:<secret>@localhost:5050/api/v1/webhooks/customerio-gambit-broadcast?origin=broadcastLite",
      "body": {
        "broadcastId": "2IkRmKYUqySjPTEEHDS8q1",
        "userId": "{{customer.id}}",
        "addrState": "{{customer.addr_state}}",
        "mobile": "{{customer.phone}}",
        "smsStatus": "{{customer.sms_status}}"
      }
    },
    "stats": {
      "outbound": {
        "total": 13059
      },
      "inbound": {
        "total": 460,
        "macros": {
          "subscriptionStatusStop": 25,
          "sendInfoMessage": 1,
          "declinedTopic": 40,
          "confirmedTopic": 384,
          "catchAll": 10
        }
      }
    }
  }
}
```
</details>
