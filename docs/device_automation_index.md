---
title: "Device Automations"
sidebar_label: Introduction
---
设备自动化为用户提供了一个在Home Assistant的核心概念之上的设备中心层。在创建自动化时，用户不再需要处理状态和事件等核心概念。相反，他们将能够选择一个设备，然后从预定义的触发器、条件和动作列表中选择。

集成可以通过公开函数来生成预定义的触发器、条件和动作，并具有可以监听触发器、检查条件和执行动作的函数，从而连接到此系统。

设备自动化不会公开额外的功能，而是为用户提供了不必学习新概念的方式。设备自动化在幕后使用事件、状态和服务助手。

### 次级设备自动化

某些设备可能会公开很多设备自动化。为了不使用户感到压倒性，可以将设备自动化标记为次级。标记为次级的设备自动化仍然会显示给用户，但可能会在其他设备自动化之后显示，或要求用户选择“显示更多”选项或类似选项。

如果设备自动化通过`entity_id`键引用实体，则如果所引用的实体隐藏或所引用实体的实体类别不为`None`，次级标志将自动设置为`True`。以下示例显示了如何将设备自动化标记为次级。

```python
from homeassistant.const import (
    CONF_DEVICE_ID,
    CONF_DOMAIN,
    CONF_PLATFORM,
    CONF_TYPE,
)
from homeassistant.helpers import device_registry as dr

async def async_get_triggers(hass, device_id):
    """Return a list of triggers."""

    device_registry = dr.async_get(hass)
    device = device_registry.async_get(device_id)

    triggers = []

    # Determine which triggers are supported by this device_id ...

    triggers.append({
        # Required fields of TRIGGER_BASE_SCHEMA
        CONF_PLATFORM: "device",
        CONF_DOMAIN: "mydomain",
        CONF_DEVICE_ID: device_id,
        # Required fields of TRIGGER_SCHEMA
        CONF_TYPE: "less_important_trigger",
        # Mark the trigger as secondary
        "metadata": {"secondary": True},
    })

    return triggers
```
