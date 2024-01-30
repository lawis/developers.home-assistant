---
title: "Firing events"
---

一些集成表示具有事件的设备或服务，例如当检测到运动或按下瞬时按钮时。集成可以通过在Home Assistant中将它们作为事件触发来向用户提供这些事件。

您的集成应该以`<domain>_event`类型的事件进行触发。例如，ZHA集成触发`zha_event`事件。

如果事件与特定设备/服务相关联，应正确地标识它们。通过向事件数据添加一个包含设备注册表中设备标识符的`device_id`属性来实现。


```python
event_data = {
    "device_id": "my-device-id",
    "type": "motion_detected",
}
hass.bus.async_fire("mydomain_event", event_data)
```


如果设备或服务只能触发事件，您需要[在设备注册表中手动注册](device_registry_index.md#manual-registration)它。

## 使事件对用户可见

可以使用[设备触发器](device_automation_trigger.md)将特定事件附加到设备，使事件对用户可见。通过设备触发器，用户将能够查看设备的所有可用事件，并在其自动化中使用它们。

## 不应该做的事情

与事件相关的代码不应成为集成实体逻辑的一部分。您希望从`async_setup_entry`函数内部的`__init__.py`中将集成事件转换为Home Assistant事件的逻辑。

实体状态不应表示事件。例如，您不希望在事件发生时将二进制传感器设置为30秒的“开”状态。
