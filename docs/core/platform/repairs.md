---
title: "问题修复"
---

Home Assistant 会跟踪需要引起用户注意的问题。这些问题可以由集成或 Home Assistant 本身创建。问题可以通过 RepairsFlow 修复，也可以通过链接到一个网站提供的信息让用户自行解决。

## 创建问题

```python
from homeassistant.helpers import issue_registry as ir

ir.async_create_issue(
    hass,
    DOMAIN,
    "manual_migration",
    breaks_in_ha_version="2022.9.0",
    is_fixable=False,
    severity=ir.IssueSeverity.ERROR,
    translation_key="manual_migration",
)
```

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| domain | 字符串 | | 引发问题的领域 |
| issue_id | 字符串 | | 问题的标识符，在 `domain` 内必须是唯一的 |
| breaks_in_ha_version | 字符串 | `None` | 问题破坏的版本 |
| data | 字典 | `None` | 随意的数据，不向用户显示 |
| is_fixable | 布尔值 | | 如果问题可以自动修复，则为True |
| is_persistent | 布尔值 | | 如果问题在 Home Assistant 重新启动时应该持久存在，则为True |
| issue_domain | 字符串 | `None` | 在代表其他集成创建问题时由集成设置 |
| learn_more_url | 字符串 | `None` | 用户可以找到更多关于问题的详细信息的URL |
| severity | IssueSeverity |  | 问题的严重程度 |
| translation_key | 字符串 |  | 简要说明问题的翻译键 |
| translation_placeholders | 字典 | `None` | 将注入到翻译中的占位符 |

## 提供修复方法

在您的集成文件夹中创建一个名为 `repairs.py` 的新平台文件，并按照以下模式添加代码。


```python
from __future__ import annotations

import voluptuous as vol

from homeassistant import data_entry_flow
from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant


class Issue1RepairFlow(RepairsFlow):
    """Handler for an issue fixing flow."""

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> data_entry_flow.FlowResult:
        """Handle the first step of a fix flow."""

        return await (self.async_step_confirm())

    async def async_step_confirm(
        self, user_input: dict[str, str] | None = None
    ) -> data_entry_flow.FlowResult:
        """Handle the confirm step of a fix flow."""
        if user_input is not None:
            return self.async_create_entry(title="", data={})

        return self.async_show_form(step_id="confirm", data_schema=vol.Schema({}))


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str | int | float | None] | None,
) -> RepairsFlow:
    """Create flow."""
    if issue_id == "issue_1":
        return Issue1RepairFlow()
```


## 问题的生命周期

### 问题的持久性

问题将一直保留在问题注册表中，直到它被创建它的集成或用户[修复](#修复问题)它为止。

`is_persistent`标志控制问题是否应在 Home Assistant 重新启动后再次显示给用户：
- 如果在问题上设置了`is_persistent`标志，则问题在重新启动后将再次显示给用户。对于仅在出现问题时才能检测到的问题（更新失败，自动化中的未知服务），请使用此选项。
- 如果在问题上未设置`is_persistent`标志，则在重新启动 Home Assistant 之前，该问题将不会再次显示给用户，直到它由其集成再次创建。对于可以检查的问题（例如低磁盘空间），请使用此选项。

### 忽略的问题

用户可以“忽略”问题。被忽略的问题将被忽略，直到它被明确删除——无论是由集成删除还是由用户成功地执行其[修复流程](#修复问题)——然后再次创建。无论[问题的持久性](#问题的持久性)如何，忽略问题都会影响 Home Assistant 的重新启动。

## 删除问题

通常，集成不需要删除问题，但在某些情况下，这可能是有用的。

```python
from homeassistant.helpers import issue_registry as ir

ir.async_delete_issue(hass, DOMAIN, "manual_migration")
```


## 修复问题
如果问题的`is_fixable`标志设置为`True`，用户将被允许修复问题。成功修复的问题将从问题注册表中移除。