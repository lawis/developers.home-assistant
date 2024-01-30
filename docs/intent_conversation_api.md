---
title: "Conversation API 对话api"
sidebar_label: "Conversation API"
---

可以使用[conversation integration](https://www.home-assistant.io/integrations/conversation/)从文本中识别意图并触发。

有一个可用的 API 端点，它接收一个输入句子，并生成一个[意图响应](#intent-response)。通过传递 Home Assistant 生成的[对话 ID](#conversation-id)，可以跟踪跨多个输入和响应的"对话"。

API 可通过 Rest API 和 Websocket API 访问。

可以使用以下方式将句子 POST 到 `/api/conversation/process`：

```json
{
  "text": "turn on the lights in the living room",
  "language": "en"
}
```

Or sent via the WebSocket API like:

```json
{
  "type": "conversation/process",
  "text": "turn on the lights in the living room",
  "language": "en"
}
```

可用的输入字段如下：

| 名称 | 类型 | 描述 |
|---------|--------|-----------------------------------------------------------------------------------------------------|
| `text` | string | 输入的句子。|
| `language` | string | 可选。输入句子的语言（默认为配置的语言）。|
| `conversation_id` | string | 可选。用于[跟踪对话](#conversation-id)的唯一 ID。由 Home Assistant 生成。|


## 对话响应

从 `/api/conversation/process` 返回的 JSON 响应包含有关触发意图的影响的信息，例如：


```json
{
  "response": {
    "response_type": "action_done",
    "language": "en",
    "data": {
      "targets": [
        {
          "type": "area",
          "name": "Living Room",
          "id": "living_room"
        },
        {
          "type": "domain",
          "name": "light",
          "id": "light"
        }
      ],
      "success": [
        {
          "type": "entity",
          "name": "My Light",
          "id": "light.my_light"
        }
      ],
      "failed": [],
    },
    "speech": {
      "plain": {
        "speech": "Turned Living Room lights on"
      }
    }
  },
  "conversation_id": "<generated-id-from-ha>",
}
```

在`"response"`对象中有以下属性可用：

| 名称 | 类型 | 描述 |
|---------|--------|--------------------------------------------------------------------------------------------------------------|
| `response_type` | string | `action_done`、`query_answer` 或 `error` 中的一个（参见 [响应类型](#response-types)）。 |
| `data` | 字典 | 每个 [响应类型](#response_types) 的相关数据。|
| `language` | string | 意图和响应的语言。|
| `speech` | 字典 | 可选。用于向用户回复的响应文本（参见 [speech](#speech)）。|


[对话 ID](#conversation-id)将与意图响应一起返回。


## 响应类型

### Action Done

意图在 Home Assistant 中进行了操作，例如打开灯。响应的 `data` 属性包含一个 `targets` 列表，其中每个目标如下所示：

| 名称 | 类型 | 描述 |
|---------|--------|-----------------------------------------------------------------------|
| `type` | string | 目标类型。其中之一：`area`、`domain`、`device_class`、`device`、`entity` 或 `custom`。|
| `name` | string | 受影响目标的名称。|
| `id` | string | 可选。目标的 ID。|

还包括两个额外的目标列表，其中包含操作的 `success` 或 `failed` 的设备或实体：

```json
{
  "response": {
    "response_type": "action_done",
    "data": {
      "targets": [
        (area or domain)
      ],
      "success": [
        (entities/devices that succeeded)
      ],
      "failed": [
        (entities/devices that failed)
      ]
    }
  }
}
```


一个意图可以有多个目标，这些目标会互相叠加。这些目标必须按照从一般到特定的顺序排列：

* `area`
  * A [registered area](https://developers.home-assistant.io/docs/area_registry_index/)
* `domain`
  * Home Assistant integration domain, such as "light"
* `device_class`
  * Device class for a domain, such as "garage_door" for the "cover" domain
* `device`
  * A [registered device](https://developers.home-assistant.io/docs/device_registry_index)
* `entity`
  * A [Home Assistant entity](https://developers.home-assistant.io/docs/architecture/devices-and-services)
* `custom`
  * A custom target


大多数意图最终会有 0、1 或 2 个目标。目前只有在涉及设备类时才会出现 3 个目标。以下是目标组合的示例：

 * "Turn off all lights"
     * 1 target: `domain:light`
 * "Turn on the kitchen lights"
     * 2 targets: `area:kitchen`, `domain:light`
 * "Open the kitchen blinds"
     * 3 targets: `area:kitchen`, `domain:cover`, `device_class:blind`


### 查询回答

此响应是对问题的回答，比如“温度是多少？”请参见 [speech](#speech) 属性以获取回答文本。

```json
{
  "response": {
    "response_type": "query_answer",
    "language": "en",
    "speech": {
      "plain": {
        "speech": "It is 65 degrees"
      }
    },
    "data": {
      "targets": [
        {
          "type": "domain",
          "name": "climate",
          "id": "climate"
        }
      ],
      "success": [
        {
          "type": "entity",
          "name": "Ecobee",
          "id": "climate.ecobee"
        }
      ],
      "failed": [],
    }
  },
  "conversation_id": "<generated-id-from-ha>",
}
```


### 错误

在意图识别或处理过程中发生了错误。请参见 `data.code` 获取具体的错误类型，并参考 [speech](#speech) 属性获取错误消息。

```json
{
  "response": {
    "response_type": "error",
    "language": "en",
    "data": {
      "code": "no_intent_match"
    },
    "speech": {
      "plain": {
        "speech": "Sorry, I didn't understand that"
      }
    }
  }
}
```

`data.code` 是一个字符串，可能是以下之一：

* `no_intent_match` - 输入文本与任何意图都不匹配。
* `no_valid_targets` - 指定的区域、设备或实体不存在。
* `failed_to_handle` - 处理意图时发生了意外错误。
* `unknown` - 意图处理范围之外发生了错误。

## 语音

响应给用户的口述回答包含在响应的 `speech` 属性中。它可以是纯文本（默认情况下），也可以是 [SSML](https://www.w3.org/TR/speech-synthesis11/)。

对于纯文本语音，响应如下所示：

```json
{
  "response": {
    "response_type": "...",
    "speech": {
      "plain": {
        "speech": "...",
        "extra_data": null
      }
    }
  },
  "conversation_id": "<generated-id-from-ha>",
}
```


如果语音是 [SSML](https://www.w3.org/TR/speech-synthesis11/) 格式，它将如下所示：
```json
{
  "response": {
    "response_type": "...",
    "speech": {
      "ssml": {
        "speech": "...",
        "extra_data": null
      }
    }
  },
  "conversation_id": "<generated-id-from-ha>",
}
```


## 会话 ID

如果回答的会话代理支持，可以通过在 Home Assistant 中生成的唯一 ID 来跟踪会话。要继续会话，请从 HTTP API 响应（同时包括 [intent response](#intent-response)）中获取 `conversation_id`，并将其添加到下一个 [input sentence](#input-sentence) 中：

初始输入句子：

```json
{
  "text": "Initial input sentence."
}
```

JSON response contains conversation id:

```json
{
  "conversation_id": "<generated-id-from-ha>",
  "response": {
    (intent response)
  }
}
```

POST with the next input sentence:

```json
{
  "text": "Related input sentence.",
  "conversation_id": "<generated-id-from-ha>"
}
```


## Pre-loading Sentences 

Sentences for a language can be pre-loaded using the WebSocket API:

```json
{
  "type": "conversation/prepare",
  "language": "en"
}
```

The following input fields are available:

| Name       | Type   | Description                                                                    |
|------------|--------|--------------------------------------------------------------------------------|
| `language` | string | Optional. Language of the sentences to load (defaults to configured language). |
