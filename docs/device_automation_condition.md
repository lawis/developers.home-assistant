---
title: "Device Conditions 设备状态"
sidebar_label: Conditions
---

设备条件允许用户检查特定条件是否满足。例如，灯是否开启或地板是否潮湿。

设备条件被定义为字典。这些字典由您的集成创建，并传递给您的集成以创建检查条件的函数。

设备条件可以由提供设备的集成（例如ZHA、deCONZ）或设备具有实体的实体集成（例如灯、湿度传感器）提供。
后者的一个示例可能是检查灯是否开启或地板是否潮湿。

如果条件需要动态验证，而静态的`CONDITION_SCHEMA`无法提供，则可以实现`async_validate_condition_config`函数。

```py
async def async_validate_condition_config(hass: HomeAssistant, config: ConfigType) -> ConfigType:
    """Validate config."""
```

Home Assistant包含一个用于开始使用设备条件的模板。要开始，可以在开发环境中运行`python3 -m script.scaffold device_condition`命令。

模板将在您的集成文件夹中创建一个名为`device_condition.py`的新文件，并创建一个与之匹配的测试文件。该文件包含以下函数和常量：

#### `CONDITION_SCHEMA`

这是条件的模式。基本模式应该是从`homeassistant.helpers.config_validation.DEVICE_CONDITION_BASE_SCHEMA`继承的模式。

#### `async_get_conditions`

```py
async def async_get_conditions(
    hass: HomeAssistant, device_id: str
) -> list[dict[str, str]]:
    """List device conditions for devices."""
```

返回此设备支持的条件列表。

#### `async_condition_from_config`

```py
@callback
def async_condition_from_config(
    config: ConfigType, config_validation: bool
) -> condition.ConditionCheckerType:
    """Create a function to test a device condition."""
```

从一个函数创建条件函数。条件函数应该是一个支持异步的回调函数，用于评估条件并返回一个`bool`值。

`config_validation`参数将由核心使用，以便根据定义的`CONDITION_SCHEMA`有条件地应用配置验证。