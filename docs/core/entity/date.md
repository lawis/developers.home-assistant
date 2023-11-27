---
title: Date Entity
sidebar_label: Date
---

`date` 是一个实体，允许用户向集成输入日期。从 [`homeassistant.components.date.DateEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/date/__init__.py) 派生实体平台。

## 属性

:::tip
属性应仅从内存中返回信息，而不执行 I/O 操作（例如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述
| ---- | ---- | ------- | -----------
| native_value | date | **必需** | 日期的值。

其他适用于所有实体的通用属性，如 `icon`、`name` 等也适用。

## 方法

### 设置值

当用户或自动化想要更新值时调用。

```python
class MyDate(DateEntity):
    # Implement one of these methods.

    def set_value(self, value: date) -> None:
        """Update the current value."""

    async def async_set_value(self, value: date) -> None:
        """Update the current value."""

```
