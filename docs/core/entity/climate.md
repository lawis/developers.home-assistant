---
title: Climate Entity 气候实体
sidebar_label: Climate 气候
---
一个气候实体控制温度、湿度或风扇，比如空调系统和加湿器。从[`homeassistant.components.climate.ClimateEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/climate/__init__.py)派生一个平台实体。

## 属性

:::tip
属性应该只从内存中返回信息，而不应该执行I/O操作（如网络请求）。实现`update()`或`async_update()`来获取数据。
:::

| 名称                    | 类型   | 默认值                              | 描述                                                                                                  |
| ----------------------- | ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| temperature_unit        | 字符串 | `NotImplementedError`                | 系统的温度测量单位（`TEMP_CELSIUS`或`TEMP_FAHRENHEIT`）。                    |
| precision               | 浮点数 | 基于 `temperature_unit`          | 系统温度的精度。对于 `TEMP_CELSIUS` 默认为十分之一，否则为整数。 |
| current_temperature     | 浮点数  | None                                 | 当前温度。                                                                                     |
| current_humidity        | 整数    | None                                 | 当前湿度。                                                                                        |
| target_temperature      | 浮点数  | None                                 | 当前设定的目标温度。                                                                 |
| target_temperature_high | 浮点数  | None                                 | 目标温度的上限                                                                 |
| target_temperature_low  | 浮点数  | None                                 | 目标温度的下限                                                                 |
| target_temperature_step | 浮点数  | None                                 | 支持的目标温度增加/减小的步长                                      |
| target_humidity         | 浮点数  | None                                 | 设备试图达到的目标湿度。需要`SUPPORT_TARGET_HUMIDITY`。                       |
| max_temp                | 浮点数  | `DEFAULT_MAX_TEMP`（值 == 35）     | 返回最大温度。                                                                             |
| min_temp                | 浮点数  | `DEFAULT_MIN_TEMP`（值 == 7）      | 返回最小温度。                                                                             |
| max_humidity            | 整数    | `DEFAULT_MAX_HUMIDITY`（值 == 99） | 返回最大湿度。需要`SUPPORT_TARGET_HUMIDITY`。                                         |
| min_humidity            | 整数    | `DEFAULT_MIN_HUMIDITY`（值 == 30） | 返回最小湿度。需要`SUPPORT_TARGET_HUMIDITY`。                                         |
| hvac_mode               | HVACMode | `NotImplementedError()`              | 当前操作（例如，制热、制冷、空闲）。用于确定`state`。                                    |
| hvac_action             | 字符串 | None                                 | 当前HVAC动作（加热、制冷）                                                                 |
| hvac_modes              | 列表   | `NotImplementedError()`              | 可用操作模式的列表。见下文。                                                                |
| preset_mode             | 字符串 | `NotImplementedError()`              | 当前激活的预设。需要`SUPPORT_PRESET_MODE`。                                                   |
| preset_modes            | 列表   | `NotImplementedError()`              | 可用预设。需要`SUPPORT_PRESET_MODE`。                                                       |
| fan_mode                | 字符串 | `NotImplementedError()`              | 返回当前风扇模式。需要`SUPPORT_FAN_MODE`。                                                   |
| fan_modes               | 列表   | `NotImplementedError()`              | 返回可用风扇模式的列表。需要`SUPPORT_FAN_MODE`。                                        |
| swing_mode              | 字符串 | `NotImplementedError()`              | 返回摆动设置。需要`SUPPORT_SWING_MODE`。                                                    |
| swing_modes             | 列表   | `NotImplementedError()`              | 返回可用摆动模式的列表。需要`SUPPORT_SWING_MODE`。                                    |
| is_aux_heat             | 布尔   | None                                 | 如果辅助加热器开启，则返回True。需要`SUPPORT_AUX_HEAT`。                                    |
| supported_features      | 整数    | `NotImplementedError()`              | 支持特

### HVAC模式

您只能使用由`HVACMode`枚举提供的内置HVAC模式。如果您需要其他模式，请添加相应的预设。

| 名称                 | 描述                                                  |
| -------------------- | ----------------------------------------------------- |
| `HVACMode.OFF`       | 设备已关闭。                                          |
| `HVACMode.HEAT`      | 设备设置为加热至目标温度。                            |
| `HVACMode.COOL`      | 设备设置为冷却至目标温度。                            |
| `HVACMode.HEAT_COOL` | 设备设置为加热/冷却至目标温度范围。                   |
| `HVACMode.AUTO`      | 设备按计划、学习行为或人工智能设置。                    |
| `HVACMode.DRY`       | 设备设置为干燥/湿度模式。                              |
| `HVACMode.FAN_ONLY`  | 设备仅启用风扇。没有加热或冷却。                        |

### HVAC操作

HVAC操作描述了当前的操作状态。这与模式不同，因为如果设备已设置为加热，且目标温度已达到，设备将不再主动加热。只能使用由`HVACAction`枚举提供的内置HVAC操作。

| 名称                    | 描述                                    |
| ----------------------- | --------------------------------------- |
| `HVACAction.OFF`        | 设备已关闭。                            |
| `HVACAction.PREHEATING` | 设备正在预热。                          |
| `HVACAction.HEATING`    | 设备正在加热。                          |
| `HVACAction.COOLING`    | 设备正在冷却。                          |
| `HVACAction.DRYING`     | 设备正在干燥。                          |
| `HVACAction.FAN`        | 设备的风扇已启动。                      |
| `HVACAction.IDLE`       | 设备处于空闲状态。                      |

### 预设

设备可以具有不同的预设，可以向用户展示。常见的预设包括"离开"或"节能"。有几个内置的预设将提供翻译，但您也可以添加自定义预设。

| 名称       | 描述                                                  |
| ---------- | ----------------------------------------------------- |
| `ECO`      | 设备正在运行节能模式。                                |
| `AWAY`     | 设备处于离开模式。                                    |
| `BOOST`    | 设备已将所有阀门完全打开。                            |
| `COMFORT`  | 设备处于舒适模式。                                    |
| `HOME`     | 设备处于家庭模式。                                    |
| `SLEEP`    | 设备已准备好睡眠模式。                                |
| `ACTIVITY` | 设备正在响应活动（例如移动传感器）。                  |

### 风扇模式

设备的风扇可以具有不同的状态。有几个内置的风扇模式，但您也可以使用自定义风扇模式。

| 名称          |
| ------------- |
| `FAN_ON`      |
| `FAN_OFF`     |
| `FAN_AUTO`    |
| `FAN_LOW`     |
| `FAN_MEDIUM`  |
| `FAN_HIGH`    |
| `FAN_MIDDLE`  |
| `FAN_FOCUS`   |
| `FAN_DIFFUSE` |

### 摇摆模式

设备的风扇可以具有不同的摇摆模式，用户可以了解和控制。

| 名称               | 描述                                            |
| ------------------ | ----------------------------------------------- |
| `SWING_OFF`        | 风扇不摇摆。                                    |
| `SWING_ON`         | 风扇正在摇摆。                                  |
| `SWING_VERTICAL`   | 风扇正在垂直摇摆。                              |
| `SWING_HORIZONTAL` | 风扇正在水平摇摆。                              |
| `SWING_BOTH`       | 风扇正在水平和垂直方向上同时摇摆。                |

## 支持的功能

支持的功能可以使用`ClimateEntityFeature`枚举中的值来定义，并使用按位或（`|`）运算符进行组合。

| 值                         | 描述                                                           |
| -------------------------- | -------------------------------------------------------------- |
| `TARGET_TEMPERATURE`       | 设备支持目标温度。                                             |
| `TARGET_TEMPERATURE_RANGE` | 设备支持目标温度范围。适用于HVAC模式`heat_cool`和`auto`。         |
| `TARGET_HUMIDITY`          | 设备支持目标湿度。                                             |
| `FAN_MODE`                 | 设备支持风扇模式。                                             |
| `PRESET_MODE`              | 设备支持预设。                                                 |
| `SWING_MODE`               | 设备支持摇摆模式。                                             |
| `AUX_HEAT`                 | 设备支持辅助加热器。                                           |

## Methods

### Set HVAC mode

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_hvac_mode(self, hvac_mode):
        """Set new target hvac mode."""

    async def async_set_hvac_mode(self, hvac_mode):
        """Set new target hvac mode."""
```

### Set preset mode

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_preset_mode(self, preset_mode):
        """Set new target preset mode."""

    async def async_set_preset_mode(self, preset_mode):
        """Set new target preset mode."""
```

### Set fan mode

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_fan_mode(self, fan_mode):
        """Set new target fan mode."""

    async def async_set_fan_mode(self, fan_mode):
        """Set new target fan mode."""
```

### Set humidity

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_humidity(self, humidity):
        """Set new target humidity."""

    async def async_set_humidity(self, humidity):
        """Set new target humidity."""
```

### Set swing mode

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_swing_mode(self, swing_mode):
        """Set new target swing operation."""

    async def async_set_swing_mode(self, swing_mode):
        """Set new target swing operation."""
```

### Set temperature

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def set_temperature(self, **kwargs):
        """Set new target temperature."""

    async def async_set_temperature(self, **kwargs):
        """Set new target temperature."""
```

### Control auxiliary heater

```python
class MyClimateEntity(ClimateEntity):
    # Implement one of these methods.

    def turn_aux_heat_on(self):
        """Turn auxiliary heater on."""

    async def async_turn_aux_heat_on(self):
        """Turn auxiliary heater on."""

    # Implement one of these methods.

    def turn_aux_heat_off(self):
        """Turn auxiliary heater off."""

    async def async_turn_aux_heat_off(self):
        """Turn auxiliary heater off."""
```
