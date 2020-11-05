# RiveScript

```
GET /api/v2/rivescript
```

Returns the [deparsed RiveScript](https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md#user-content-data-deparse) used for outbound replies.

We've modified the deparsed RiveScript output to append new Gambit-specific properties to each array property in the `topics` object:

* `macro` - (string) If set, the raw RiveScript `reply` value corresponds to a hardcoded macro. The `reply` property will be set to the text rendered by the macro.

* `hardcoded` - (boolean) Whether this trigger is defined in Contentful (only occurrs when in the default topic, `random`. Refs "Topics" section in [RiveScript docs](https://www.rivescript.com/docs/tutorial)).

### Query parameters

Name | Type | Description
-----|------|------------
`cache` | string | If set to `false`, fetches additional default topic triggers from Contentful, and and sorts bot replies.

## Examples

<details>
<summary><strong>Example Request</strong></summary>

```
curl -X "GET" "http://localhost:5100/api/v2/rivescript?cache=false" \
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
            "These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or https://dosome.click/2z6uc. Txt STOP to quit. Msg&Data Rates May Apply."
          ],
          "condition": [
            
          ],
          "redirect": null,
          "previous": null,
          "macro": "sendInfoMessage",
          "hardcoded": true
        },
        {
          "trigger": "help",
          "reply": [
            null
          ],
          "condition": [
            
          ],
          "redirect": "info",
          "previous": null,
          "macro": null,
          "hardcoded": true
        },
        {
          "trigger": "subscribe",
          "reply": [
            "👋 Welcome to DoSomething.org! Meet the staffers who'll be texting you: https://www.dosomething.org/us/articles/meet-the-staff-sms?user_id={{user.id}}&utm_campaign=sms_compliance_message&utm_medium=sms&utm_source=content_fun\n\nMsg&DataRatesApply. Txt HELP for help, STOP to stop."
          ],
          "condition": [
            
          ],
          "redirect": null,
          "previous": null,
          "macro": "subscriptionStatusActive",
          "hardcoded": true
        },
        {
          "trigger": "covid",
          "reply": [
            "While you're stuck inside due to COVID-19, use our resources to stay healthy, fight anxiety & make a difference in your community. Do you want to:\\n\nA) Read our resource guide\\n\nB) Get actions to do from home\\n\nC) Share social distancing tips{topic=kljOPm29CnIfEcWTQtxqI}"
          ],
          "condition": [
            
          ],
          "redirect": null,
          "previous": null,
          "macro": null,
          "hardcoded": false
        },
        ...
      ]
    }
    ...
  }
}
 
```
</details>
