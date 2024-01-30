---
title: Scene Entity
sidebar_label: Scene
--- 

场景实体是一个实体，可以为一组实体[重现所需的状态](/docs/core/platform/reproduce_state/)。场景实体可以激活一组设备的场景，但从Home Assistant的角度来看，它保持无状态。

场景实体派生自[`homeassistant.components.scene.Scene`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/scene/__init__.py)。

如果您想表示可以打开和关闭（因此具有实际状态）的东西，应改用`switch`实体。

场景实体也可以通过场景编辑器或YAML由用户[创建](https://www.home-assistant.io/integrations/scene)。

## 属性

由于此集成是无状态的，因此不提供任何特定的属性。
所有实体通用的其他属性，如`icon`和`name`等，仍然适用。

## 方法

### 激活
Activate the scene.

```python
class MySwitch(Scene):
    # Implement one of these methods.

    def activate(self, **kwargs: Any) -> None:
        """Activate scene. Try to get entities into requested state."""

    async def async_activate(self, **kwargs: Any) -> None:
        """Activate scene. Try to get entities into requested state."""
```

activate方法可用于激活场景至设备或服务。
当用户按下场景的`激活`按钮或调用`scene.turn_on`服务以激活场景时，Home Assistant会调用该方法。

### 可用的设备类别

没有特定的设备类别。场景实体上未设置`device_class`属性。