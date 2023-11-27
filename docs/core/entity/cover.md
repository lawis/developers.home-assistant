---
title: Cover Entity
sidebar_label: Cover
---

一个覆盖物实体用于控制门窗、窗帘等的打开或覆盖动作。请从[`homeassistant.components.cover.CoverEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/cover/__init__.py)派生一个平台实体。

## 属性

:::tip
属性应当仅从内存中返回信息，而不进行 I/O 操作（如网络请求）。请实现 `update()` 或 `async_update()` 方法来获取数据。
:::

### 平台属性（由派生平台类实现）

| 名称 | 类型 | 默认值 | 描述
| ---- | ---- | ------- | -----------
| current_cover_position | int | None | 覆盖物当前位置，其中 0 表示关闭，100 表示完全打开。在使用 `SUPPORT_SET_POSITION` 时为必需。
| current_cover_tilt_position | int | None | 覆盖物当前倾斜位置，其中 0 表示关闭/无倾斜，100 表示打开/最大倾斜。在使用 `SUPPORT_SET_TILT_POSITION` 时为必需。
| is_opening | bool | None | 覆盖物是否正在打开。用于确定状态。
| is_closing | bool | None | 覆盖物是否正在关闭。用于确定状态。
| is_closed | bool | `NotImplementedError()` | 覆盖物是否关闭。如果状态未知，返回 `None`。用于确定状态。

### 实体属性（可以被子类覆盖的基类属性）

| 名称 | 类型 | 默认值 | 描述
| ---- | ---- | ------- | -----------
| device_class | string | None | 描述覆盖物的类型/类别。必须为 `None` 或下表中的有效值之一。
| supported_features | int（位操作）| 从 `current_cover_position` 和 `current_cover_tilt_position` 确定的值 | 描述支持的功能。详见下表。

### 设备类别

| 常量 | 描述
|----------|-----------------------|
| `CoverDeviceClass.AWNING` | 遮阳篷的控制，例如外部伸缩窗户、门或阳台遮挡物。
| `CoverDeviceClass.BLIND` | 百叶窗的控制，是连接的板片，展开或折叠以覆盖开口，也可以倾斜部分覆盖开口，例如窗帘。
| `CoverDeviceClass.CURTAIN` | 窗帘的控制，通常是悬挂在窗户或门上的织物，可以被拉开。
| `CoverDeviceClass.DAMPER` | 机械调节器（减少气流、噪音或光线）的控制。
| `CoverDeviceClass.DOOR` | 门的控制，通常提供对结构部分的访问。
| `CoverDeviceClass.GARAGE` | 车库门的控制，通常提供对车库的访问。
| `CoverDeviceClass.GATE` | 门的控制，通常提供对车道或其他区域的访问。门位于建筑物外部，通常属于围栏的一部分。
| `CoverDeviceClass.SHADE` | 百叶窗的控制，是一块连续的材料或连接的隔室，可以展开或折叠以覆盖开口，例如窗帘。
| `CoverDeviceClass.SHUTTER` | 百叶窗的控制，是连接的板片，可以摆动以覆盖开口，也可以倾斜部分覆盖开口，例如室内或室外百叶窗。
| `CoverDeviceClass.WINDOW` | 物理窗户的控制，可以打开、关闭或倾斜。

### 状态

| 常量 | 描述
|----------|------------------------|
| `STATE_OPENING` | 覆盖物正在打开至设定位置。
| `STATE_OPEN` | 覆盖物已完全打开。
| `STATE_CLOSING` | 覆盖物正在关闭至设定位置。
| `STATE_CLOSED` | 覆盖物已完全关闭。

## 支持的功能

支持的功能使用 `CoverEntityFeature` 枚举的值，并使用按位或（`|`）操作符进行组合。

| 值               | 描述                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| `OPEN`              | 覆盖物支持打开操作。                                                 |
| `CLOSE`             | 覆盖物支持关闭操作。                                                 |
| `SET_POSITION`      | 覆盖物支持定位操作，可以在完全打开和完全关闭之间移动到指定的位置。      |
| `STOP`              | 覆盖物支持停止当前操作（打开、关闭、定位）。       |
| `OPEN_TILT`         | 覆盖物支持倾斜开操作。                                           |
| `CLOSE_TILT`        | 覆盖物支持倾斜关操作。                                         |
| `SET_TILT_POSITION` | 覆盖物支持定位倾斜操作，可以在完全打开和完全关闭之间移动到指定的倾斜位置。 |
| `STOP_TILT`         | 覆盖物支持停止当前倾斜操作（开、关、定位）。  |

## Methods

### Open cover

如果设置了 `SUPPORT_OPEN` 标志，请实现此方法。
```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def open_cover(self, **kwargs):
        """Open the cover."""

    async def async_open_cover(self, **kwargs):
        """Open the cover."""
```

### Close cover

如果设置了 `SUPPORT_CLOSE` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def close_cover(self, **kwargs):
        """Close cover."""

    async def async_close_cover(self, **kwargs):
        """Close cover."""
```

### 设置覆盖物位置

如果设置了 `SUPPORT_SET_POSITION` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def set_cover_position(self, **kwargs):
        """Move the cover to a specific position."""

    async def async_set_cover_position(self, **kwargs):
        """Move the cover to a specific position."""
```


### 停止覆盖物

如果设置了 `SUPPORT_STOP` 标志，请实现此方法。
```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def stop_cover(self, **kwargs):
        """Stop the cover."""

    async def async_stop_cover(self, **kwargs):
        """Stop the cover."""
```

### 打开覆盖物倾斜

如果设置了 `SUPPORT_OPEN_TILT` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def open_cover_tilt(self, **kwargs):
        """Open the cover tilt."""

    async def async_open_cover_tilt(self, **kwargs):
        """Open the cover tilt."""
```

### 关闭覆盖物倾斜

如果设置了 `SUPPORT_CLOSE_TILT` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def close_cover_tilt(self, **kwargs):
        """Close the cover tilt."""

    async def async_close_cover_tilt(self, **kwargs):
        """Close the cover tilt."""
```

### 设置覆盖物倾斜位置

如果设置了 `SUPPORT_SET_TILT_POSITION` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def set_cover_tilt_position(self, **kwargs):
        """Move the cover tilt to a specific position."""

    async def async_set_cover_tilt_position(self, **kwargs):
        """Move the cover tilt to a specific position."""
```

### 停止覆盖物倾斜

如果设置了 `SUPPORT_STOP_TILT` 标志，请实现此方法。

```python
class MyCover(CoverEntity):
    # Implement one of these methods.

    def stop_cover_tilt(self, **kwargs):
        """Stop the cover."""

    async def async_stop_cover_tilt(self, **kwargs):
        """Stop the cover."""
```
