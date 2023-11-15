---
title: Button Entity
sidebar_label: Button
---

按钮实体是一个可以向设备或服务发送事件/触发操作的实体，但从Home Assistant的角度来看，它是无状态的。它可以类比为真实的瞬时开关、按钮或其他形式的无状态开关。然而，它不适用于实际物理按钮的实现；按钮实体的唯一目的是在Home Assistant中提供一个虚拟按钮。

开关按钮实体是从[`homeassistant.components.button.ButtonEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/button/__init__.py)派生而来的，可用于控制设备功能，例如（但不限于）：

- 升级固件
- 重启设备
- 冲泡一杯咖啡
- 重置某些内容（如计数器、滤芯使用情况）

如果您想表示可以打开和关闭的内容（因此具有实际状态），可以使用`switch`实体。如果您想在Home Assistant中集成一个真实的、物理的无状态按钮设备，可以通过触发自定义事件来实现。按钮实体不适用于这些情况。

## 属性

由于此集成是无状态的，因此它不提供任何特定的属性。
所有实体都共用的其他属性，如`device_class`、`icon`、`name`等仍然适用。

## 方法

### Press

press方法可用于触发与设备或服务相关的操作。
当用户按下按钮或调用了按下按钮的服务时，Home Assistant将调用此方法。

```python
class MyButton(ButtonEntity):
    # Implement one of these methods.

    def press(self) -> None:
        """Handle the button press."""

    async def async_press(self) -> None:
        """Handle the button press."""
```

### Available device classes

可选项，指定实体的类型。可能映射到谷歌设备类型。

| 常量 | 描述
| ----- | -----------
| `ButtonDeviceClass.IDENTIFY` | 按钮实体用于识别设备。
| `ButtonDeviceClass.RESTART` | 按钮实体用于重新启动设备。
| `ButtonDeviceClass.UPDATE` | 按钮实体用于更新设备软件。建议避免使用该设备类别，请考虑使用[`update`](/docs/core/entity/update)实体。