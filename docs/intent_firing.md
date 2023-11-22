---
title: "Firing intents 触发意图"
---

如果您的代码将用户的语音或文本匹配到意图上，您可以让Home Assistant处理该意图。这可以通过您自己的集成内部完成，也可以通过通用的意图处理API完成。

当您触发一个意图时，您将收到一个响应或者可能会出现错误。您的代码需要将结果返回给用户。

## HTTP API

在加载意图集成时，将在`/api/intent/handle`路径上提供一个HTTP API端点。您可以向该端点POST JSON数据，其中包含意图名称和其数据：

```json
{
  "name": "HassTurnOn",
  "data": {
    "name": "Kitchen Light"
  }
}
```

## Home Assistant集成

Example code to handle an intent in Home Assistant.
以下是在Home Assistant中处理意图的示例代码

```python
from homeassistant.helpers import intent

intent_type = "TurnLightOn"
slots = {"entity": {"value": "Kitchen"}}

try:
    intent_response = await intent.async_handle(
        hass, "example_component", intent_type, slots
    )

except intent.UnknownIntent as err:
    _LOGGER.warning("Received unknown intent %s", intent_type)

except intent.InvalidSlotInfo as err:
    _LOGGER.error("Received invalid slot data: %s", err)

except intent.IntentError:
    _LOGGER.exception("Error handling request for %s", intent_type)
```


意图响应是`homeassistant.helpers.intent.IntentResponse`的一个实例。

| 名称 | 类型 | 描述 |
| ---- | ---- | ----------- |
| `intent` | Intent | 触发响应的意图实例 |
| `speech` | 字典 | 语音响应。每个键是一种类型。允许的类型有`plain`和`ssml` |
| `reprompt` | 字典 | 提示响应。每个键是一种类型。允许的类型有`plain`和`ssml`。<br />当需要用户的响应时，使用此选项来保持会话开启。在这些情况下，`speech`通常是一个问题。 |
| `card` | 字典 | 卡片响应。每个键是一种类型。 |

语音字典的值：

| 名称 | 类型 | 描述 |
| ---- | ---- | ----------- |
| `speech` | 字符串 | 要说的文本 |
| `extra_data` | 任意类型 | 与此语音相关的额外信息 |

提示字典的值：

| 名称 | 类型 | 描述 |
| ---- | ---- | ----------- |
| `reprompt` | 字符串 | 当用户花费过长时间来回应时要说的文本 |
| `extra_data` | 任意类型 | 与此提示相关的额外信息 |

卡片字典的值：

| 名称 | 类型 | 描述 |
| ---- | ---- | ----------- |
| `title` | 字符串 | 卡片的标题 |
| `content` | 任意类型 | 卡片的内容