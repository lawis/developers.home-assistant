---
title: "WebSocket API"
---

Home Assistant 包含一个 WebSocket API。这个 API 可以用来将信息从 Home Assistant 实例传输到任何实现了 WebSockets 的客户端上。我们维护一个[JavaScript 库](https://github.com/home-assistant/home-assistant-js-websocket)，在我们的前端中使用该库。

## 服务器状态

1. 客户端连接。
2. 认证阶段开始。
   - 服务器发送`auth_required`消息。
   - 客户端发送`auth`消息。
   - 如果`auth`消息正确：转到步骤 3。
   - 服务器发送`auth_invalid`消息。转到步骤 6。
3. 发送`auth_ok`消息。
4. 认证阶段结束。
5. 命令阶段开始。
   1. 客户端可以发送命令。
   2. 服务器可以发送之前命令的结果。
6. 客户端或服务器断开会话。

在命令阶段，客户端会为每条消息附加一个唯一标识符。服务器将在每条消息中添加此标识符，以便客户端可以将每条消息与其来源关联起来。

## 消息格式

每个 API 消息都是一个 JSON 序列化对象，包含一个`type`键。在认证阶段后，消息还必须包含一个`id`，它是一个整数，表示交互次数。

以下是一个`auth`消息的示例：

```json
{
  "type": "auth",
  "access_token": "ABCDEFGHIJKLMNOPQ"
}
```

```json
{
   "id": 5,
   "type":"event",
   "event":{
      "data":{},
      "event_type":"test_event",
      "time_fired":"2016-11-26T01:37:24.265429+00:00",
      "origin":"LOCAL"
   }
}
```

## Authentication phase

当客户端连接到服务器时，服务器会发送`auth_required`消息。

```json
{
  "type": "auth_required",
  "ha_version": "2021.5.3"
}
```


客户端的第一条消息应该是一个`auth`消息。您可以使用访问令牌进行授权。
```json
{
  "type": "auth",
  "access_token": "ABCDEFGH"
}
```

如果客户端提供有效的身份验证，服务器将通过发送`auth_ok`消息来完成认证阶段：

```json
{
  "type": "auth_ok",
  "ha_version": "2021.5.3"
}
```


如果数据不正确，服务器将以`auth_invalid`消息回复并断开与客户端的连接。
```json
{
  "type": "auth_invalid",
  "message": "Invalid password"
}
```

## 命令阶段

在这个阶段，客户端可以向服务器发送命令。服务器将对每个命令做出响应，使用一个`result`消息指示命令何时完成以及是否成功，同时提供命令的上下文信息。

```json
{
  "id": 6,
  "type": "result",
  "success": true,
  "result": {
    "context": {
      "id": "326ef27d19415c60c492fe330945f954",
      "parent_id": null,
      "user_id": "31ddb597e03147118cf8d2f8fbea5553"
    }
  }
}
```

## 订阅事件

命令`subscribe_events`将会将您的客户端订阅到事件总线上。您可以选择同时监听所有事件或特定类型的事件。如果您想要监听多个事件类型，您需要发送多个`subscribe_events`命令。

```json
{
  "id": 18,
  "type": "subscribe_events",
  // Optional
  "event_type": "state_changed"
}
```

服务器将会以`result`消息作为回应，来指示订阅已经生效。
```json
{
  "id": 18,
  "type": "result",
  "success": true,
  "result": null
}
```


对于每个匹配的事件，服务器将会发送一个类型为`event`的消息。消息中的`id`将指向原始`listen_event`命令的`id`。

```json
{
   "id": 18,
   "type":"event",
   "event":{
      "data":{
         "entity_id":"light.bed_light",
         "new_state":{
            "entity_id":"light.bed_light",
            "last_changed":"2016-11-26T01:37:24.265390+00:00",
            "state":"on",
            "attributes":{
               "rgb_color":[
                  254,
                  208,
                  0
               ],
               "color_temp":380,
               "supported_features":147,
               "xy_color":[
                  0.5,
                  0.5
               ],
               "brightness":180,
               "white_value":200,
               "friendly_name":"Bed Light"
            },
            "last_updated":"2016-11-26T01:37:24.265390+00:00",
            "context": {
               "id": "326ef27d19415c60c492fe330945f954",
               "parent_id": null,
               "user_id": "31ddb597e03147118cf8d2f8fbea5553"
            }
         },
         "old_state":{
            "entity_id":"light.bed_light",
            "last_changed":"2016-11-26T01:37:10.466994+00:00",
            "state":"off",
            "attributes":{
               "supported_features":147,
               "friendly_name":"Bed Light"
            },
            "last_updated":"2016-11-26T01:37:10.466994+00:00",
            "context": {
               "id": "e4af5b117137425e97658041a0538441",
               "parent_id": null,
               "user_id": "31ddb597e03147118cf8d2f8fbea5553"
            }
         }
      },
      "event_type":"state_changed",
      "time_fired":"2016-11-26T01:37:24.265429+00:00",
      "origin":"LOCAL",
      "context": {
         "id": "326ef27d19415c60c492fe330945f954",
         "parent_id": null,
         "user_id": "31ddb597e03147118cf8d2f8fbea5553"
      }
   }
}
```

## Subscribe to trigger

你还可以使用`subscribe_trigger`命令订阅一个或多个触发器。这些触发器的语法与[自动化触发器](https://www.home-assistant.io/docs/automation/trigger/)相同。你可以定义一个或多个触发器。

```json
{
    "id": 2,
    "type": "subscribe_trigger",
    "trigger": {
        "platform": "state",
        "entity_id": "binary_sensor.motion_occupancy",
        "from": "off",
        "to":"on"
    }
}
```

As a response you get:

```json
{
 "id": 2,
 "type": "result",
 "success": true,
 "result": null
}
```

对于每个匹配的触发器，服务器将会发送一个类型为`trigger`的消息。消息中的`id`将指向原始`subscribe_trigger`命令的`id`。请注意，基于使用的触发器，你的变量将是不同的。

```json
{
    "id": 2,
    "type": "event",
    "event": {
        "variables": {
            "trigger": {
                "id": "0",
                "idx": "0",
                "platform": "state",
                "entity_id": "binary_sensor.motion_occupancy",
                "from_state": {
                    "entity_id": "binary_sensor.motion_occupancy",
                    "state": "off",
                    "attributes": {
                        "device_class": "motion",
                        "friendly_name": "motion occupancy"
                    },
                    "last_changed": "2022-01-09T10:30:37.585143+00:00",
                    "last_updated": "2022-01-09T10:33:04.388104+00:00",
                    "context": {
                        "id": "90e30ad8e6d0c218840478d3c21dd754",
                        "parent_id": null,
                        "user_id": null
                    }
                },
                "to_state": {
                    "entity_id": "binary_sensor.motion_occupancy",
                    "state": "on",
                    "attributes": {
                        "device_class": "motion",
                        "friendly_name": "motion occupancy"
                    },
                    "last_changed": "2022-01-09T10:33:04.391956+00:00",
                    "last_updated": "2022-01-09T10:33:04.391956+00:00",
                    "context": {
                        "id": "9b263f9e4e899819a0515a97f6ddfb47",
                        "parent_id": null,
                        "user_id": null
                    }
                },
                "for": null,
                "attribute": null,
                "description": "state of binary_sensor.motion_occupancy"
            }
        },
        "context": {
            "id": "9b263f9e4e899819a0515a97f6ddfb47",
            "parent_id": null,
            "user_id": null
        }
    }
}
```

### Unsubscribing from events

你可以取消之前创建的订阅。将原始订阅命令的id作为值传递给订阅字段即可。

```json
{
  "id": 19,
  "type": "unsubscribe_events",
  "subscription": 18
}
```

服务器将会回复一个结果消息，以指示取消订阅是否成功。
```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": null
}
```

## Fire an event

这将在 Home Assistant 事件总线上触发一个事件。
```json
{
  "id": 24,
  "type": "fire_event",
  "event_type": "mydomain_event",
  // Optional
  "event_data": {
    "device_id": "my-device-id",
    "type": "motion_detected"
  }
}
```

服务器将通过一个结果消息来响应，以指示事件已成功触发。
```json
{
  "id": 24,
  "type": "result",
  "success": true,
  "result": {
    "context": {
      "id": "326ef27d19415c60c492fe330945f954",
      "parent_id": null,
      "user_id": "31ddb597e03147118cf8d2f8fbea5553"
    }
  }
}
```

## Calling a service


这将在 Home Assistant 中调用服务。当前没有返回值。如果客户端希望了解由于服务调用而导致的实体变化，可以监听 `state_changed` 事件。

```json
{
  "id": 24,
  "type": "call_service",
  "domain": "light",
  "service": "turn_on",
  // Optional
  "service_data": {
    "color_name": "beige",
    "brightness": "101"
  }
  // Optional
  "target": {
    "entity_id": "light.kitchen"
  }
}
```

服务器将用一条消息表示服务执行完毕。
```json
{
  "id": 24,
  "type": "result",
  "success": true,
  "result": {
    "context": {
      "id": "326ef27d19415c60c492fe330945f954",
      "parent_id": null,
      "user_id": "31ddb597e03147118cf8d2f8fbea5553"
    }
  }
}
```

## Fetching states 获取状态

这将获取 Home Assistant 中所有当前状态的快照。

```json
{
  "id": 19,
  "type": "get_states"
}
```

服务器将用包含状态的结果消息作出响应。
```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": [ ... ]
}
```

## Fetching config 获取状态

这将获取Home Assistant中当前配置的详细信息。

```json
{
  "id": 19,
  "type": "get_config"
}
```

服务器将用包含配置信息的结果消息作出响应。
```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": { ... }
}
```

## Fetching services

这将获取Home Assistant中当前服务的详细信息。

```json
{
  "id": 19,
  "type": "get_services"
}
```

服务器将用包含服务信息的结果消息作出响应。
```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": { ... }
}
```

## 获取面板信息

这将获取 Home Assistant 中当前注册的面板的详细信息。

```json
{
  "id": 19,
  "type": "get_panels"
}
```

服务器将用包含当前已注册面板信息的结果消息作出响应。
```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": [ ... ]
}
```

## Pings and Pongs

API 支持接收来自客户端的 ping 消息并返回一个 pong 消息。这相当于一个心跳包，用于确保连接仍然存活。

```json
{
    "id": 19,
    "type": "ping"
}
```

如果连接仍然活动，服务器必须尽快发送一个 pong 回复。
```json
{
    "id": 19,
    "type": "pong"
}
```

## 验证配置

此命令允许您验证触发器、条件和操作配置。`trigger`、`condition` 和 `action` 字段将被验证，就好像它们是自动化的一部分（因此也允许触发器/条件/操作列表）。所有字段都是可选的，结果中只包含传入的字段键。

```json
{
  "id": 19,
  "type": "validate_config",
  "trigger": ...,
  "condition": ...,
  "action": ...
}
```

服务器将以验证结果作为响应。响应中只包含在命令消息中出现的字段。

```json
{
  "id": 19,
  "type": "result",
  "success": true,
  "result": {
    "trigger": {"valid": true, "error": null},
    "condition": {"valid": false, "error": "Invalid condition specified for data[0]"},
    "action": {"valid": true, "error": null}
  }
}
```

## 错误处理

如果发生错误，则 `result` 消息中的 `success` 键将被设置为 `false`。它将包含一个名为 `error` 的键，其中包含一个具有两个键（`code` 和 `message`）的对象。

```json
{
   "id": 12,
   "type":"result",
   "success": false,
   "error": {
      "code": "invalid_format",
      "message": "Message incorrectly formatted: expected str for dictionary value @ data['event_type']. Got 100"
   }
}
```
