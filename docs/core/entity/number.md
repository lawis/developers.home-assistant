---
title: Number Entity
sidebar_label: Number
---

`number` 是一种实体，允许用户向集成输入任意值。从 [`homeassistant.components.number.NumberEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/number/__init__.py) 派生实体平台。

## 属性

:::tip
属性应该只从内存中返回信息，而不执行 I/O 操作（如网络请求）。实现 `update()` 或 `async_update()` 方法来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述 |
| ---- | ---- | ------- | ----------- |
| device_class | string | `None` | 数字类型。 |
| mode | string | `auto` | 定义数字在用户界面中应如何显示。推荐使用默认值 `auto`。可以使用 `box` 或 `slider` 强制指定显示模式。 |
| native_max_value | float | 100 | 数字 `native_unit_of_measurement` 中接受的最大值（包括该值）。 |
| native_min_value | float | 0 | 数字 `native_unit_of_measurement` 中接受的最小值（包括该值）。 |
| native_step | float | **参见下文** | 定义值的分辨率，即数字 `native_unit_of_measurement` 中的最小增量或减量。 |
| native_unit_of_measurement | string | `None` | 数字值所表示的计量单位。如果 `native_unit_of_measurement` 是 °C 或 °F，并且其 `device_class` 是温度，则数字的 `unit_of_measurement` 将是用户配置的首选温度单位，数字的 `state` 将是可选单位转换后的 `native_value`。 |
| native_value | float | **必需** | 数字的值，以数字的 `native_unit_of_measurement` 表示。 |
| native_unit_of_measurement | string | `None` | 传感器值所表示的计量单位。如果 `native_unit_of_measurement` 是 °C 或 °F，并且其 `device_class` 是温度，则传感器的 `unit_of_measurement` 将是用户配置的首选温度单位，传感器的 `state` 将是可选单位转换后的 `native_value`。 |

其他通用于所有实体的属性，如 `icon`、`name` 等也适用。

默认的步进值是根据范围（max - min）动态选择的。如果 max_value 和 min_value 之间的差大于 1.0，则默认步进为 1.0。然而，如果范围较小，则步进值会被除以 10，直到步进值小于范围。

### 可用的设备类型

如果指定了设备类别，你的数字实体还需要返回正确的度量单位。

| 常量 | 支持的单位 | 描述
| ---- | ---- | -----------
| `NumberDeviceClass.APPARANT_POWER` | VA | 视在功率 |
| `NumberDeviceClass.AQI` | None | 空气质量指数
| `NumberDeviceClass.ATMOSPHERIC_PRESSURE` | cbar、bar、hPa、inHg、kPa、mbar、Pa、psi | 大气压力，统计数据将存储为帕斯卡。
| `NumberDeviceClass.BATTERY` | % | 剩余电池百分比
| `NumberDeviceClass.CARBON_DIOXIDE` | ppm | 二氧化碳浓度。
| `NumberDeviceClass.CARBON_MONOXIDE` | ppm | 一氧化碳浓度。
| `NumberDeviceClass.CURRENT` | A、mA | 电流
| `NumberDeviceClass.DATA_RATE` | bit/s、kbit/s、Mbit/s、Gbit/s、B/s、kB/s、MB/s、GB/s、KiB/s、MiB/s、GiB/s | 数据传输速率
| `NumberDeviceClass.DATA_SIZE` | bit、kbit、Mbit、Gbit、B、kB、MB、GB、TB、PB、EB、ZB、YB、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB | 数据大小
| `NumberDeviceClass.DISTANCE` | km、m、cm、mm、mi、yd、in | 通用距离
| `NumberDeviceClass.ENERGY` | Wh、kWh、MWh、MJ、GJ | 能量，该设备类别应用于表示能源消耗，例如电表。表示的是“功率”乘以“时间”。注意不要与“功率”混淆。
| `NumberDeviceClass.ENERGY_STORAGE` | Wh、kWh、MWh、MJ、GJ | 储存的能量，该设备类别用于表示已存储的能量，例如电池中当前存储的电能量或电池的容量。表示的是“功率”乘以“时间”。注意不要与“功率”混淆。
| `NumberDeviceClass.FREQUENCY` | Hz、kHz、MHz、GHz | 频率
| `NumberDeviceClass.GAS` | m³、ft³、CCF | 燃气体积。以千瓦时（kWh）而不是升计量的燃气耗量应分类为能量。
| `NumberDeviceClass.HUMIDITY` | % | 相对湿度
| `NumberDeviceClass.ILLUMINANCE` | lx | 光照强度
| `NumberDeviceClass.IRRADIANCE` | W/m²、BTU/(h⋅ft²) | 辐照度
| `NumberDeviceClass.MOISTURE` | % | 湿度
| `NumberDeviceClass.MONETARY` | [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) | 货币值和币种。
| `NumberDeviceClass.NITROGEN_DIOXIDE` | µg/m³ | 二氧化氮浓度 |
| `NumberDeviceClass.NITROGEN_MONOXIDE` | µg/m³ | 一氧化氮浓度 |
| `NumberDeviceClass.NITROUS_OXIDE` | µg/m³ | 氮氧化物浓度 |
| `NumberDeviceClass.OZONE` | µg/m³ | 臭氧浓度 |
| `SensorDeviceClass.PH` | None | 水溶液的酸碱度（pH）|
| `NumberDeviceClass.PM1` | µg/m³ | 小于1微米颗粒物质的浓度 |
| `NumberDeviceClass.PM25` | µg/m³ | 小于2.5微米颗粒物质的浓度 |
| `NumberDeviceClass.PM10` | µg/m³ | 小于10微米颗粒物质的浓度 |
| `NumberDeviceClass.POWER` | W、kW | 功率
| `NumberDeviceClass.POWER_FACTOR` | %、None | 功率因数
| `NumberDeviceClass.PRECIPITATION` | cm、in、mm | 降水量
| `NumberDeviceClass.PRECIPITATION_INTENSITY` | in/d、in/h、mm/d、mm/h | 降水强度
| `NumberDeviceClass.PRESSURE` | cbar、bar、hPa、inHg、kPa、mbar、Pa、psi | 压力
| `NumberDeviceClass.REACTIVE_POWER` | var | 无功功率 |
| `NumberDeviceClass.SIGNAL_STRENGTH` | dB、dBm | 信号强度
| `NumberDeviceClass.SOUND_PRESSURE` | dB、dBA | 声压级
| `NumberDeviceClass.SPEED` | ft/s、in/d、in/h、km/h、kn、m/s、mph、mm/d | 通用速度
| `NumberDeviceClass.SULPHUR_DIOXIDE` | µg/m³ | 二氧化硫浓度 |
| `NumberDeviceClass.TEMPERATURE` | °C、°F、K | 温度
| `NumberDeviceClass.VOLATILE_ORGANIC_COMPOUNDS` | µg/m³ | 挥发性有机化合物浓度
| `NumberDeviceClass.VOLTAGE` | V、mV | 电压
| `NumberDeviceClass.VOLUME` | L、mL、加仑、液体盎司、m³、ft³、CCF | 通用体积，该设备类别用于表示消耗量，例如车辆消耗的燃料量。
| `NumberDeviceClass.VOLUME_STORAGE` | L、mL、加仑、液体盎司、m³、ft³、CCF | 通用储存体积，该设备类别用于表示已存储的体积，例如燃油箱中的燃油量。
| `NumberDeviceClass.WATER` | L、加仑、m³、ft³、CCF | 水消耗
| `NumberDeviceClass.WEIGHT` | kg、g、mg、µg、盎司、磅、英石 | 通用质量；为了与日常语言保持一致，使用“重量”而不是“质量”。
| `NumberDeviceClass.WIND_SPEED` | ft/s、km/h、kn、m/s、mph | 风速

## 恢复数字状态

在重新启动或重新加载后恢复状态的数字不应扩展`RestoreEntity`，因为它不存储`native_value`，而是存储可能已被数字基本实体修改的`state`。要在`async_added_to_hass`中获取存储的`native_min_value`、`native_max_value`、`native_step`、`native_unit_of_measurement`和`native_value`，应扩展`RestoreNumber`并调用`await self.async_get_last_number_data`。

## 方法

### 设置值

Called when the user or an automation wants to update the value.

```python
class MyNumber(NumberEntity):
    # Implement one of these methods.

    def set_native_value(self, value: float) -> None:
        """Update the current value."""

    async def async_set_native_value(self, value: float) -> None:
        """Update the current value."""

```
