---
title: "Device Actions 设备操作"
sidebar_label: Actions
---

设备操作允许用户让设备执行某些操作。例如，打开灯或开门。

设备操作被定义为字典。这些字典由您的集成创建，并传递给您的集成以创建执行该操作的函数。

设备操作可以由提供设备的集成（例如 ZHA、deCONZ）或具有与设备关联的实体集成（例如灯、开关）提供。
前者的示例可能是重新启动设备，而后者的示例可能是打开灯。

如果操作需要动态验证，而静态的`ACTION_SCHEMA`无法提供，则可以实现`async_validate_action_config`函数。

```py
async def async_validate_action_config(hass: HomeAssistant, config: ConfigType) -> ConfigType:
    """Validate config."""
```

Home Assistant 包括一个模板，用于开始使用设备操作。要开始使用，请在开发环境中运行`python3 -m script.scaffold device_action`。

该模板将在您的集成文件夹中创建一个名为`device_action.py`的新文件，以及一个匹配的测试文件。该文件包含以下函数和常量：

#### `ACTION_SCHEMA`

这是用于操作的架构。基本架构应该从`homeassistant.helpers.config_validation.DEVICE_ACTION_BASE_SCHEMA`继承。不要手动应用架构。如果操作架构在集成的`device_action.py`模块中定义为常量，核心将应用架构。

#### `async_get_actions`

```py
async def async_get_actions(hass: HomeAssistant, device_id: str) -> list[dict]:
    """List device actions for devices."""
```

返回该设备支持的操作列表。

#### `async_call_action_from_config`

```py
async def async_call_action_from_config(
    hass: HomeAssistant, config: dict, variables: dict, context: Context | None
) -> None:
    """Execute a device action."""
```

执行传入的操作。
