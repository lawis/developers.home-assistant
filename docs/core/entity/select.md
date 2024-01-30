---
title: Select Entity
sidebar_label: Select
---

`select`是一种实体，允许用户从集成提供的有限选项列表中选择选项。从[`homeassistant.components.select.SelectEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/select/__init__.py)派生实体平台。

只有在没有更好的选项可用的情况下才应使用这个实体。
例如，一个灯泡可以具有用户可选择的光效。虽然可以使用这个`select`实体来实现，但它应该真正成为`light`实体的一部分，因为`light`实体已经支持光效。

## 属性

:::tip
属性应始终只从内存中返回信息，不进行I/O操作（如网络请求）。实现`update()`或`async_update()`来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述 |
| ---- | ---- | ------- | ---- |
| current_option | str | None | 当前选择的选项 |
| options | list | **Required** | 以字符串形式提供的可用选项列表 |

其他实体通用的属性，如`icon`，`unit_of_measurement`，`name`等也适用。
## Methods

### Select option

Called when the user or automation wants to change the current selected option.

```python
class MySelect(SelectEntity):
    # Implement one of these methods.

    def select_option(self, option: str) -> None:
        """Change the selected option."""

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""

```
