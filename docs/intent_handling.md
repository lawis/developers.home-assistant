---
title: "Handling intents 处理意图"
---

任何组件都可以注册来处理意图。这使得单个组件能够处理来自多个语音助手的意图。

一个组件必须为它想处理的每种类型注册一个意图处理器。意图处理器必须扩展`homeassistant.helpers.intent.IntentHandler`类。

```python
from homeassistant.helpers import intent

DATA_KEY = "example_key"


async def async_setup(hass, config):
    hass.data[DATA_KEY] = 0
    intent.async_register(hass, CountInvocationIntent())


class CountInvocationIntent(intent.IntentHandler):
    """Handle CountInvocationIntent intents."""

    # Type of intent to handle
    intent_type = "CountInvocationIntent"

    # Optional. A validation schema for slots
    # slot_schema = {
    #     'item': cv.string
    # }

    async def async_handle(self, intent_obj):
        """Handle the intent."""
        intent_obj.hass.data[DATA_KEY] += 1
        count = intent_obj.hass.data[DATA_KEY]

        response = intent_obj.create_response()
        response.async_set_speech(
            f"This intent has been invoked {count} times"
        )
        return response
```
