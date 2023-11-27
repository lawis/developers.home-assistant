---
title: Event entity
sidebar_label: Event
---

事件是在发生某些事情时发出的信号，例如当用户按下物理按钮（如门铃）或按下遥控器上的按钮时。事件实体将这些事件捕获在物理世界中，并将它们作为实体在Home Assistant中提供。

事件实体是无状态的，这意味着您不需要维护状态。相反，当物理世界中发生某些事件时，您可以触发一个事件。Home Assistant会跟踪最后一个发出的事件，并将其显示为实体的当前状态。

实体的主要状态是上次发出事件的时间戳，此外还会跟踪事件的类型以及可选的随事件提供的额外状态数据。

事件实体从[`homeassistant.components.event.EventEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/event/__init__.py)派生。

## 属性

:::tip
属性应总是仅从内存中返回信息，而不执行I/O操作（如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称         | 类型              | 默认值       | 描述                                                     |
| ------------- | ----------------- | ------------ | ------------------------------------------------------- |
| event_types   | 字符串列表      | **必需**     | 此实体可以触发的可能事件类型列表。                              |

适用于所有实体的其他属性，如 `device_class`、`icon`、`name` 等也适用。

## 触发事件

事件实体与其他实体略有不同。Home Assistant管理状态，但整合是负责触发事件的。这可以通过在事件实体上调用 `_trigger_event` 方法来完成。

此方法接受事件类型作为第一个参数，并可选地接受额外的状态数据作为第二个参数。

```python
class MyEvent(EventEntity):

    _attr_device_class = EventDeviceClass.BUTTON
    _attr_event_types = ["single_press", "double_press"]

    @callback
    def _async_handle_event(self, event: str) -> None:
        """Handle the demo button event."""
        self._trigger_event(event, {"extra_data": 123})
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Register callbacks with your device API/library."""
        my_device_api.listen(self._async_handle_event)
```

只能触发在 `event_types` 属性中定义的事件类型。如果触发了在 `event_types` 属性中未定义的事件类型，将会引发 `ValueError`。

:::tip
确保在从Home Assistant中删除实体时取消注册所有的回调函数。
:::

### 可用的设备类别

可选地指定它是什么类型的实体。

| 常量                         | 描述                                     |
| --------------------------- | ---------------------------------------- |
| `EventDeviceClass.BUTTON`   | 按下遥控器上的按钮。                    |
| `EventDeviceClass.DOORBELL` | 专门用于门铃按钮。                      |
| `EventDeviceClass.MOTION`   | 由运动传感器检测到的运动事件。           |
