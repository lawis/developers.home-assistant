---
title: Fan Entity
sidebar_label: Fan
---

风扇实体是控制风扇的不同参数（如速度、方向和摆动）的设备。从 ['homeassistant.components.fan.FanEntity'](https://github.com/home-assistant/core/blob/dev/homeassistant/components/fan/__init__.py) 派生实体平台。

## 属性

:::tip
属性应总是仅从内存中返回信息，而不执行I/O操作（如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称                 | 类型         | 默认值   | 描述                                       |
| -------------------- | ---------- | -------- | ------------------------------------------ |
| current_direction   | 字符串       | `None`   | 返回风扇的当前方向。                          |
| is_on                | 布尔值        | `None`   | 如果实体处于打开状态，则返回True。                         |
| oscillating         | 布尔值        | `None`   | 如果风扇正在摆动，则返回True。                           |
| percentage          | 整数         | `None`   | 返回当前速度的百分比。必须是0到100之间的值。           |
| speed_count         | 整数         | 100      | 风扇支持的速度数。                              |
| supported_features  | 整数         | 0        | 支持的功能标志。                               |
| preset_mode         | 字符串       | `None`   | 返回当前的预设模式。应为`preset_modes`中的一个值，如果没有活动的预设模式，则返回`None`。 |
| preset_modes        | 列表         | `None`   | 获取可用的预设模式列表。这是一个任意的字符串列表，不能包含任何速度设置。                  |

### 预设模式

风扇可以具有预设模式，可以自动控制百分比速度或其他功能。常见的示例包括 `auto`、`smart`、`whoosh`、`eco` 和 `breeze`。如果没有设置预设模式，则 `preset_mode` 属性必须设置为 `None`。

预设模式不应包含命名（手动）速度设置，因为这些应该表示为百分比。

手动设置速度必须禁用任何设置的预设模式。如果可以在不禁用预设模式的情况下手动设置百分比速度，请创建一个开关或服务来表示预设模式。

## 支持的功能

支持的功能使用 `FanEntityFeature` 枚举中的值定义，并使用按位或 (`|`) 操作符组合。

| 值              | 描述                                           |
| --------------- | ---------------------------------------------- |
| `DIRECTION`     | 风扇支持更改方向。                              |
| `OSCILLATE`     | 风扇支持摆动。                                 |
| `PRESET_MODE`   | 风扇支持预设模式。                              |
| `SET_SPEED`     | 风扇支持设置速度百分比和可选预设模式。          |

## 方法

### 设置方向

仅在设置了 `SUPPORT_DIRECTION` 标志时才实现此方法。

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def set_direction(self, direction: str) -> None:
        """Set the direction of the fan."""

    async def async_set_direction(self, direction: str) -> None:
        """Set the direction of the fan."""
```

### 设置预设模式

只有在设置了 `SUPPORT_PRESET_MODE` 标志时才实现此方法。

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def set_preset_mode(self, preset_mode: str) -> None:
        """Set the preset mode of the fan."""

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        """Set the preset mode of the fan."""
```

### 设置速度百分比

只有在设置了 `SUPPORT_SET_SPEED` 标志时才实现此方法。

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def set_percentage(self, percentage: int) -> None:
        """Set the speed percentage of the fan."""

    async def async_set_percentage(self, percentage: int) -> None:
        """Set the speed percentage of the fan."""
```

:::tip Converting speeds

Home Assistant includes a utility to convert speeds.

If the device has a list of named speeds:

```python
from homeassistant.util.percentage import ordered_list_item_to_percentage, percentage_to_ordered_list_item

ORDERED_NAMED_FAN_SPEEDS = ["one", "two", "three", "four", "five", "six"]  # off is not included

percentage = ordered_list_item_to_percentage(ORDERED_NAMED_FAN_SPEEDS, "three")

named_speed = percentage_to_ordered_list_item(ORDERED_NAMED_FAN_SPEEDS, 23)

...

    @property
    def percentage(self) -> Optional[int]:
        """Return the current speed percentage."""
        return ordered_list_item_to_percentage(ORDERED_NAMED_FAN_SPEEDS, current_speed)

    @property
    def speed_count(self) -> int:
        """Return the number of speeds the fan supports."""
        return len(ORDERED_NAMED_FAN_SPEEDS)
```

If the device has a numeric range of speeds:

```python
from homeassistant.util.percentage import int_states_in_range, ranged_value_to_percentage, percentage_to_ranged_value

SPEED_RANGE = (1, 255)  # off is not included

percentage = ranged_value_to_percentage(SPEED_RANGE, 127)

value_in_range = math.ceil(percentage_to_ranged_value(SPEED_RANGE, 50))

...

    @property
    def percentage(self) -> Optional[int]:
        """Return the current speed percentage."""
        return ranged_value_to_percentage(SPEED_RANGE, current_speed)

    @property
    def speed_count(self) -> int:
        """Return the number of speeds the fan supports."""
        return int_states_in_range(SPEED_RANGE)
```
:::

### Turn on

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def turn_on(self, speed: Optional[str] = None, percentage: Optional[int] = None, preset_mode: Optional[str] = None, **kwargs: Any) -> None:
        """Turn on the fan."""

    async def async_turn_on(self, speed: Optional[str] = None, percentage: Optional[int] = None, preset_mode: Optional[str] = None, **kwargs: Any) -> None:
        """Turn on the fan."""
```

:::tip `speed` is deprecated.

For new intergrations, `speed` should not be implemented and only `percentage` and `preset_mode` should be used.

:::

### Turn off

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def turn_off(self, **kwargs: Any) -> None:
        """Turn the fan off."""

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the fan off."""
```

### Toggle

Optional. If not implemented will default to checking what method to call using the is_on property.

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def toggle(self, **kwargs: Any) -> None:
        """Toggle the fan."""

    async def async_toggle(self, **kwargs: Any) -> None:
        """Toggle the fan."""
```

### Oscillate

Only implement this method if the flag `SUPPORT_OSCILLATE` is set.

```python
class FanEntity(ToggleEntity):
    # Implement one of these methods.

    def oscillate(self, oscillating: bool) -> None:
        """Oscillate the fan."""

    async def async_oscillate(self, oscillating: bool) -> None:
        """Oscillate the fan."""
```
