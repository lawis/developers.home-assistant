---
title: "Device Triggers 设备触发器"
sidebar_label: Triggers
---

设备触发器是与特定设备和事件或状态变化相关联的自动化触发器。例如，“灯打开”或“检测到水”。

设备触发器可以由提供设备的集成（例如ZHA、deCONZ）或设备具有实体的实体集成（例如灯、开关）提供。前者的示例是与实体无关的事件，例如遥控器或触摸面板上的键按下，而后者的示例可能是灯已经打开。

要添加对设备触发器的支持，集成需要具有`device_trigger.py`文件，并：

- *定义`TRIGGER_SCHEMA`*：表示触发器的字典，例如设备和事件类型
- *创建触发器*：创建包含设备或实体以及由模式定义的支持的事件或状态更改的字典。
- *附加触发器*：将触发器配置与事件或状态更改关联，例如在事件总线上触发的消息。
- *添加文本和翻译*：为每个触发器提供人类可读的名称。

不要手动应用静态模式。如果触发器模式在集成的`device_trigger.py`模块中被定义为常量，核心将应用该模式。

如果触发器需要动态验证，静态`TRIGGER_SCHEMA`无法提供，可以实现`async_validate_trigger_config`函数。

```py
async def async_validate_trigger_config(hass: HomeAssistant, config: ConfigType) -> ConfigType:
    """Validate config."""
```

Home Assistant 包含一个模板，用于开始使用设备触发器。要开始使用，请在开发环境中运行 `python3 -m script.scaffold device_trigger`。

模板将在您的集成文件夹中创建一个名为 `device_trigger.py` 的新文件以及一个匹配的测试文件。该文件包含以下函数和常量：

#### Define a `TRIGGER_SCHEMA`

设备触发器被定义为字典。这些字典由您的集成创建，并由您的集成用于附加触发器。

这是一个 voluptuous 模式，用于验证特定触发器字典是否表示您的集成可以处理的配置。这应该扩展 `device_automation/__init__.py` 中的 TRIGGER_BASE_SCHEMA。

```python
from homeassistant.const import (
    CONF_ENTITY_ID,
    CONF_TYPE,
)

TRIGGER_TYPES = {"water_detected", "noise_detected"}

TRIGGER_SCHEMA = TRIGGER_BASE_SCHEMA.extend(
    {
        vol.Required(CONF_TYPE): vol.In(TRIGGER_TYPES),
    }
)
```

此示例具有一个单独的`type`字段，表示支持的事件类型。

#### Create triggers

`async_get_triggers`方法返回设备或任何相关实体支持的触发器列表。这些触发器将向用户公开，以便创建自动化。

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
        CONF_TYPE: "water_detected",
    })

    return triggers
```

#### Attach triggers

To wire it up: Given a `TRIGGER_SCHEMA` config, make sure the `action` is called when the trigger is triggered.

For example, you might attach the trigger and action to [Events fired](integration_events.md) on the event bus by your integration.
#### Attach triggers

将其连接起来：给定一个`TRIGGER_SCHEMA`配置，确保在触发触发器时调用`action`。

例如，您可以将触发器和动作附加到由您的集成在事件总线上的[Events fired]触发的事件(integration_events.md)上。

```python
async def async_attach_trigger(hass, config, action, trigger_info):
    """Attach a trigger."""
    event_config = event_trigger.TRIGGER_SCHEMA(
        {
            event_trigger.CONF_PLATFORM: "event",
            event_trigger.CONF_EVENT_TYPE: "mydomain_event",
            event_trigger.CONF_EVENT_DATA: {
                CONF_DEVICE_ID: config[CONF_DEVICE_ID],
                CONF_TYPE: config[CONF_TYPE],
            },
        }
    )
    return await event_trigger.async_attach_trigger(
        hass, event_config, action, trigger_info, platform_type="device"
    )
```

返回值是一个解除触发器的函数。

#### 添加文本和翻译

自动化用户界面将在设备自动化中显示与事件类型相对应的可读字符串。请在`strings.json`中更新支持的触发器类型和子类型：

```json
{
   "device_automation": {
    "trigger_type": {
      "water_detected": "Water detected",
      "noise_detected": "Noise detected"
    }
}
```

在开发过程中测试翻译，请运行 `python3 -m script.translations develop`。