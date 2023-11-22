---
title: "Sensors 传感器"
---

`mobile_app` 集成支持通过您的应用程序完全管理的自定义传感器。

## 注册传感器

在传感器可以更新之前，必须先进行注册。与更新传感器不同，您一次只能注册一个传感器。

要注册传感器，请向 Webhook 发出如下请求：

```json
{
  "data": {
    "attributes": {
      "foo": "bar"
    },
    "device_class": "battery",
    "icon": "mdi:battery",
    "name": "Battery State",
    "state": "12345",
    "type": "sensor",
    "unique_id": "battery_state",
    "unit_of_measurement": "%",
    "state_class": "measurement",
    "entity_category": "diagnostic",
    "disabled": true
  },
  "type": "register_sensor"
}
```
有效的键包括：

| 键                 | 类型                          | 必需 | 描述                                                                                                                                                                                                    |
|---------------------|-------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| attributes          | 对象                        | 否       | 要附加到传感器的属性                                                                                                                                                                              |
| device_class        | 字符串                        | 否       | 有效的设备类之一。[二进制传感器类](https://www.home-assistant.io/integrations/binary_sensor/#device-class), [传感器类](https://www.home-assistant.io/integrations/sensor/#device-class) |
| icon                | Material Design 图标 (字符串) | 否       | 必须以`mdi:`为前缀。如果未提供，默认值为`mdi:cellphone`                                                                                                                                      |
| name                | 字符串                        | 是      | 传感器的名称                                                                                                                                                                                          |
| state               | bool, float, int, string      | 是      | 传感器的状态                                                                                                                                                                                         |
| type                | 字符串                        | 是      | 传感器的类型。必须是`binary_sensor`或`sensor`之一                                                                                                                                              |
| unique_id           | 字符串                        | 是      | 对您的应用程序安装唯一标识符。您以后将需要它。通常最好使用传感器名称的安全版本                                                                          |
| unit_of_measurement | 字符串                        | 否       | 传感器的测量单位                                                                                                                                                                          |
| state_class | 字符串 | 否 | 实体的[状态类别](../../core/entity/sensor.md#available-state-classes) (仅适用于传感器)
| entity_category | 字符串 | 否 | 实体的实体类别
| disabled | 布尔值 | 否 | 是否启用实体。

一旦注册传感器，它们将立即显示。

## 更新传感器

一旦注册了传感器，您需要更新它。这与注册非常类似，但您可以同时更新所有传感器。

例如，要更新上面注册的传感器，您将发送以下内容：

```json
{
  "data": [
    {
      "attributes": {
        "hello": "world"
      },
      "icon": "mdi:battery",
      "state": 123,
      "type": "sensor",
      "unique_id": "battery_state"
    }
  ],
  "type": "update_sensor_states"
}
```
在更新传感器时，只允许使用其中的一些键：

| 键                 | 类型                          | 必需 | 描述                                                                                                                                                                                                    |
|---------------------|-------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| attributes          | 对象                        | 否       | 要附加到传感器的属性                                                                                                                                                                              |
| icon                | Material Design 图标 (字符串) | 否       | 必须以`mdi:`为前缀。                                                                                                                                                                                                      |
| state               | bool, float, int, string      | 是      | 传感器的状态                                                                                                                                                                                         |
| type                | 字符串                        | 是      | 传感器的类型。必须是`binary_sensor`或`sensor`之一                                                                                                                                              |
| unique_id           | 字符串                        | 是      | 对您的应用程序安装唯一标识符。您以后将需要它。通常最好使用传感器名称的安全版本                                                                          |

更新传感器的响应是一个字典，其中包含 unique_id => 更新结果。

如果实体在 Home Assistant 中被禁用，成功更新后将添加键 `is_disabled`。这意味着应用程序可以禁用向传感器发送更新。

如果更新失败，将返回错误信息。

```json
{
  "battery_state": {
    "success": true
  },
  "battery_level": {
    "success": true,
    "is_disabled": true
  },
  "battery_charging": {
    "success": false,
    "error": {
      "code": "not_registered",
      "message": "Entity is not registered",
    }
  },
  "battery_charging_state": {
    "success": false,
    "error": {
      "code": "invalid_format",
      "message": "Unexpected value for type",
    }
}
```

## 与 Home Assistant 保持传感器同步

用户可以在 Home Assistant 中启用和禁用实体。禁用的实体不会被添加到 Home Assistant 中，即使集成提供了该实体。这意味着对于没有在 Home Assistant 中启用的实体，手机继续向其发送数据是没有意义的。

**当在应用程序中启用/禁用传感器时**，应用程序应该为该传感器发送 `register_sensor` webhook，并将 `disabled` 设置为 `true` 或 `false`。

**当移动应用程序发送 `update_sensor_states` webhook 以更新被禁用的实体的数据时**，更新结果将包含一个 `is_disabled` 键，其值为 `true`。这是一个指示移动应用程序需要将 Home Assistant 中的启用状态与移动应用程序进行同步的指示符。

```json
{
  "battery_level": {
    "success": true,
  },
  "battery_charging": {
    "success": true,
    "is_disabled": true
  }
}
```

**当用户在 Home Assistant 中启用/禁用实体时，需要将其同步到移动应用程序中。**`get_config` webhook 的响应中包含一个 `entities` 键。这是一个字典，将 `unique_id` 映射到 `{"disabled": boolean}`。移动应用程序应该采用这些启用的设置。

```json5
{
  // ...
  "entities": {
    "battery_level": {
      "disabled": false
    },
    "battery_charging": {
      "disabled": true
    },
  }
}
```
