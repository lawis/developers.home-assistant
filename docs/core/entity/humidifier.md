---
title: Humidifier Entity
sidebar_label: Humidifier
---

加湿器实体是一种主要用于控制湿度的设备，即加湿器或除湿机。从 [`homeassistant.components.humidifier.HumidifierEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/humidifier/__init__.py) 派生实体平台。

## 属性

:::tip
属性应仅从内存中返回信息，不应执行 I/O 操作（如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称                      | 类型    | 默认值                        | 描述                                                    |
| ------------------------- | ------- | ----------------------------- | ------------------------------------------------------- |
| target_humidity           | int     | `None`                        | 设备正在尝试达到的目标湿度。                             |
| current_humidity          | int     | `None`                        | 设备测量到的当前湿度。                                   |
| max_humidity              | int     | `DEFAULT_MAX_HUMIDITY`（值为100） | 返回最大湿度。                                          |
| min_humidity              | int     | `DEFAULT_MIN_HUMIDITY`（值为0）   | 返回最小湿度。                                          |
| mode                      | string  | `NotImplementedError()`       | 当前活动的预设模式。需要 `SUPPORT_MODES`。               |
| available_modes           | list    | `NotImplementedError()`       | 可用的模式。需要 `SUPPORT_MODES`。                       |
| supported_features        | int     |（抽象方法）                  | 支持的功能的位图。请参见下文。                          |
| is_on                     | bool    | `None`                        | 设备是否开启。                                          |
| device_class              | string  | `None`                        | 例如 `HumidifierDeviceClass.HUMIDIFIER` 或  `HumidifierDeviceClass.DEHUMIDIFIER` |
| action                    | HumidifierAction | `None`             | 返回设备的当前状态。                                    |

### 模式

设备可以具有不同的操作模式，它们可能希望向用户显示。它们可以被视为预设模式或某些特殊条件下功能降低或增强的设备状态，例如 "auto" 或 "baby"。有几种内置模式提供了翻译，但也可以添加自定义模式，以更好地表示设备。

| 名称           | 描述                                         |
| ------------- | -------------------------------------------- |
| `MODE_NORMAL`  | 无活动预设，正常运行                          |
| `MODE_ECO`     | 设备运行在节能模式下                           |
| `MODE_AWAY`    | 设备处于离开模式                             |
| `MODE_BOOST`   | 设备将所有阀门完全打开                         |
| `MODE_COMFORT` | 设备处于舒适模式                             |
| `MODE_HOME`    | 设备处于家庭模式                             |
| `MODE_SLEEP`   | 设备准备好进入睡眠模式                         |
| `MODE_AUTO`    | 设备自动控制湿度                             |
| `MODE_BABY`    | 设备试图优化给婴儿使用时的湿度                 |

## 支持的功能

支持的功能使用 `HumidifierEntityFeature` 枚举值定义，并使用按位或（`|`）运算符组合。

| 值        | 描述                |
| ---------- | -------------------------------------------- |
| `MODES`  | 设备支持不同的模式。 |

## 动作

`action` 属性可能返回设备的当前操作状态，无论它是在加湿还是空闲。这是一个信息性属性。请注意，当设备关闭时，如果存在 `action` 属性，它将自动被替换为 "off"。此外，请注意将 `action` 设置为 `off` 不会替换 `is_on` 属性。

`HumidifierAction` 的当前值：

| 名称             | 描述                                            |
| -------------- | ---------------------------------------------- |
| `HUMIDIFYING` | 设备当前正在加湿。                             |
| `DRYING`      | 设备当前正在除湿。                             |
| `IDLE`        | 设备处于开启但目前闲置状态。                      |
| `OFF`         | 设备已关闭。                                   |

## 方法

### 设置模式

```python
class MyHumidifierEntity(HumidifierEntity):
    # Implement one of these methods.

    def set_mode(self, mode):
        """Set new target preset mode."""

    async def async_set_mode(self, mode):
        """Set new target preset mode."""
```

### 设置湿度

如果当前模式不允许调整目标湿度，设备应在调用此方法时自动切换到允许的模式。

```python
class MyHumidifierEntity(HumidifierEntity):
    # Implement one of these methods.

    def set_humidity(self, humidity):
        """Set new target humidity."""

    async def async_set_humidity(self, humidity):
        """Set new target humidity."""
```

### Turn on

```python
class MyHumidifierEntity(HumidifierEntity):
    # Implement one of these methods.

    def turn_on(self, **kwargs):
        """Turn the device on."""

    async def async_turn_on(self, **kwargs):
        """Turn the device on."""
```

### Turn off

```python
class MyHumidifierEntity(HumidifierEntity):
    # Implement one of these methods.

    def turn_off(self, **kwargs):
        """Turn the device off."""

    async def async_turn_off(self, **kwargs):
        """Turn the device off."""
```
