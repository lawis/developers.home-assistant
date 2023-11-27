---
title: Remote Entity
sidebar_label: Remote
---

从[`homeassistant.components.remote.RemoteEntity`](https://github.com/home-assistant/home-assistant/blob/master/homeassistant/components/remote/__init__.py)派生实体平台。

## 属性

:::tip
属性应始终只从内存中返回信息，不进行I/O操作（如网络请求）。实现`update()`或`async_update()`来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述 |
| ---- | ---- | ------- | ---- |
| current_activity | str | None | 返回当前活动的名称 |
| activity_list | list | None | 返回可用活动的列表 |

### 活动

活动是预定义的活动或宏，可以将遥控器置于特定状态。例如，"Watch TV"活动可能会打开多个设备并将频道切换到指定的频道。

## 支持的功能

支持的功能由使用`RemoteEntityFeature`枚举中的值定义，并使用按位或（`|`）运算符进行组合。

| 值 | 描述 |
| ---------------- | --------------------------------------------- |
| `LEARN_COMMAND`  | 实体允许从设备学习命令。 |
| `DELETE_COMMAND` | 实体允许从设备删除命令。 |
| `ACTIVITY`       | 实体支持活动。                   |

## Methods

### Turn On Command

```python
class MyRemote(RemoteEntity):

    def turn_on(self, activity: str = None, **kwargs):
         """Send the power on command."""

    async def async_turn_on(self, activity: str = None, **kwargs):
         """Send the power on command."""
```

### Turn Off Command

```python
class MyRemote(RemoteEntity):

    def turn_off(self, activity: str = None, **kwargs):
         """Send the power off command."""

    async def async_turn_off(self, activity: str = None, **kwargs):
         """Send the power off command."""
```

### Toggle Command

```python
class MyRemote(RemoteEntity):

    def toggle(self, activity: str = None, **kwargs):
         """Toggle a device."""

    async def async_toggle(self, activity: str = None, **kwargs):
         """Toggle a device."""
```

### Send Command

```python
class MyRemote(RemoteEntity):

    def send_command(self, command: Iterable[str], **kwargs):
        """Send commands to a device."""

    async def async_send_command(self, command: Iterable[str], **kwargs):
        """Send commands to a device."""
```

### Learn Command

Only implement this method if the flag `SUPPORT_LEARN_COMMAND` is set.

```python
class MyRemote(RemoteEntity):

    def learn_command(self, **kwargs):
        """Learn a command from a device."""

    async def async_learn_command(self, **kwargs):
        """Learn a command from a device."""
```

### Delete Command

Only implement this method if the flag `SUPPORT_DELETE_COMMAND` is set.

```python
class MyRemote(RemoteEntity):

    def delete_command(self, **kwargs):
        """Delete a command from a device."""

    async def async_delete_command(self, **kwargs):
        """Delete a command from a device."""
```
