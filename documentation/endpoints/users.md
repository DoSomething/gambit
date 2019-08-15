# Users

```
DELETE /api/v2/users/:id
```

Removes member's PII (Personal Identifiable Information). It removes the `platformUserId` from the conversation. It removes the `text` from all inbound texts this member has sent us. It deletes all draft submissions for this member.

## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "DELETE" "http://localhost:5100/api/v2/users/597b9ef910707d07c84b00aa" \
     -H "Authorization: Basic cHVwcGV0OnRvdGFsbHlzZWNyZXQ="
```
</details>

<details>
<summary><strong>Example Response</strong></summary>

```
OK
```
</details>
