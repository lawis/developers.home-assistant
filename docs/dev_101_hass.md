---
title: "Hass object"
sidebar_label: "Introduction"
---

在开发Home Assistant时，你会经常看到一个到处都有的变量：`hass`。这是Home Assistant实例，它将为你提供访问系统各个部分的权限。

### `hass` 对象

Home Assistant实例包含四个对象，帮助你与系统进行交互。

| 对象 | 描述 |
| ------ | ----------- |
| `hass` | 这是Home Assistant的实例。允许启动、停止和排队新的作业。[查看可用方法。](https://dev-docs.home-assistant.io/en/dev/api/core.html#homeassistant.core.HomeAssistant)
| `hass.config` | 这是Home Assistant的核心配置，包括位置、温度偏好和配置目录路径。[查看可用方法。](https://dev-docs.home-assistant.io/en/dev/api/core.html#homeassistant.core.Config)
| `hass.states` | 这是StateMachine。 它允许你设置状态并跟踪状态变化。[查看可用方法。](https://dev-docs.home-assistant.io/en/dev/api/core.html#homeassistant.core.StateMachine) |
| `hass.bus` | 这是EventBus。 它允许你触发和监听事件。[查看可用方法。](https://dev-docs.home-assistant.io/en/dev/api/core.html#homeassistant.core.EventBus) |
| `hass.services` | 这是ServiceRegistry。 它允许你注册服务。 [查看可用方法。](https://dev-docs.home-assistant.io/en/dev/api/core.html#homeassistant.core.ServiceRegistry) |

<img class='invertDark'
  alt='Overview of the Home Assistant core architecture'
  src='/img/en/architecture/ha_architecture.svg'
/>

### Where to find `hass`

Depending on what you're writing, there are different ways the `hass` object is made available.

**Component**
Passed into `setup(hass, config)` or `async_setup(hass, config)`.

**Platform**
Passed into `setup_platform(hass, config, add_devices, discovery_info=None)` or `async_setup_platform(hass, config, async_add_devices, discovery_info=None)`.

**Entity**
Available as `self.hass` once the entity has been added via the `add_devices` callback inside a platform.
