---
title: Date/Time Entity
sidebar_label: Date/Time
---

`datetime` 是一个实体，允许用户向集成输入时间戳。从 [`homeassistant.components.datetime.DateTimeEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/datetime/__init__.py) 派生实体平台。

## 属性

:::tip
属性应仅从内存中返回信息，而不执行 I/O 操作（例如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述
| ---- | ---- | ------- | -----------
| native_value | datetime | **必需** | 日期时间的值。必须包括时区信息。

其他适用于所有实体的通用属性，例如 `icon`、`name` 等也适用。

## 方法

### 设置值

当用户或自动化想要更新值时调用。输入的日期时间将始终为 UTC。

```python
class MyDateTime(DateTimeEntity):
    # Implement one of these methods.

    def set_value(self, value: datetime) -> None:
        """Update the current value."""

    async def async_set_value(self, value: datetime) -> None:
        """Update the current value."""

```
