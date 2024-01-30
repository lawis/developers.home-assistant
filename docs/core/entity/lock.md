---
title: Lock Entity
sidebar_label: Lock
---

锁实体可以进行锁定和解锁操作。可以选择使用用户代码对锁定和解锁进行安全控制。某些锁还允许打开门闩，同样可以使用用户代码进行安全控制。从 [`homeassistant.components.lock.LockEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/lock/__init__.py) 派生一个平台实体。

## 属性

:::tip
属性应该始终仅从内存中返回信息，而不执行 I/O 操作（如网络请求）。实现 `update()` 或 `async_update()` 方法以获取数据。
:::

| 名称           | 类型    | 默认值 | 描述
| -------------- | ------- | ------ | -----------
| changed_by     | string  | None   | 描述最后一次更改的触发者。
| code_format    | string  | None   | 代码格式的正则表达式，如果不需要代码，则为 None。
| is_locked      | bool    | None   | 表示锁是否当前已锁定。用于确定 `state`。
| is_locking     | bool    | None   | 表示锁是否当前正在锁定中。用于确定 `state`。
| is_unlocking   | bool    | None   | 表示锁是否当前正在解锁中。用于确定 `state`。
| is_jammed      | bool    | None   | 表示锁是否当前出现故障。用于确定 `state`。

## 支持的功能

支持的功能通过使用 `LockEntityFeature` 枚举中的值进行定义，并使用按位或 (`|`) 运算符进行组合。

| 值        | 描述                        |
| ----------| --------------------------- |
| `OPEN`    | 该锁支持打开门闩。            |

## Methods

### Lock

```python
class MyLock(LockEntity):

    def lock(self, **kwargs):
        """Lock all or specified locks. A code to lock the lock with may optionally be specified."""

    async def async_lock(self, **kwargs):
        """Lock all or specified locks. A code to lock the lock with may optionally be specified."""
```

### Unlock

```python
class MyLock(LockEntity):

    def unlock(self, **kwargs):
        """Unlock all or specified locks. A code to unlock the lock with may optionally be specified."""

    async def async_unlock(self, **kwargs):
        """Unlock all or specified locks. A code to unlock the lock with may optionally be specified."""
```

### Open

Only implement this method if the flag `SUPPORT_OPEN` is set.

```python
class MyLock(LockEntity):

    def open(self, **kwargs):
        """Open (unlatch) all or specified locks. A code to open the lock with may optionally be specified."""

    async def async_open(self, **kwargs):
        """Open (unlatch) all or specified locks. A code to open the lock with may optionally be specified."""
```
