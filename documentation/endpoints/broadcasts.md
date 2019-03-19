# Broadcasts

```
GET /api/v2/broadcasts/:broadcastId
```
Fetches a broadcast from [Gambit Content API](https://github.com/DoSomething/gambit-content/tree/master/documentation), and returns additional data properties for send configuration and message stats.


## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "GET" "http://localhost:5100/api/v2/broadcasts/2CE7oRjLpU4y7v9uo5W7Or" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "id": "2CE7oRjLpU4y7v9uo5W7Or",
    "name": "EngagementTests2019_Feb14_Unresponsive_FINAL",
    "text": "Hey it's Freddie! What would you like me to send you today?\nA) My weekly advice column\nB) A news update\nC) A social change action",
    "attachments": [],
    "contentType": "askMultipleChoice",
    "webhook": {
      "headers": {
        "Content-Type": "application/json"
      },
      "url": "http://<secret>:<secret>@localhost:5050/api/v1/webhooks/customerio-gambit-broadcast",
      "body": {
        "northstarId": "{{customer.id}}",
        "broadcastId": "2CE7oRjLpU4y7v9uo5W7Or"
      }
    },
    "stats": {
      "outbound": {
        "total": 827540,
        "macros": {}
      },
      "inbound": {
        "total": 8106,
        "macros": {
          "sendInfoMessage": 5,
          "supportRequested": 3,
          "saidThirdChoice": 377,
          "subscriptionStatusStop": 3648,
          "catchAll": 100,
          "invalidAskMultipleChoiceResponse": 1902,
          "saidSecondChoice": 750,
          "saidFirstChoice": 1131
        }
      }
    }
  }
}
```
</details>
