# Rivescript

```
GET /api/v2/rivescript
```

Returns the deparsed rivescript used for outbound replies.

## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "GET" "http://localhost:5100/api/v2/rivescript" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
{
  "data": {
    "begin": {...}
    "topics": {
      "random": [
        {
          "trigger": "info",
          "reply": [
            "sendInfoMessage"
          ],
          "condition": [],
          "redirect": null,
          "previous": null
        },
        {
          "trigger": "help",
          "reply": [],
          "condition": [],
          "redirect": "info",
          "previous": null
        },
        {
          "trigger": "subscribe",
          "reply": [
            "subscriptionStatusActive"
          ],
          "condition": [],
          "redirect": null,
          "previous": null
        },
        ...
      ]
    }
    ...
  }
}
 
```
</details>
