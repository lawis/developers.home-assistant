---
title: "备份"
---

当 Home Assistant 创建备份时，可能需要暂停集成中的某些操作，或倾倒数据以便可以正确地还原。

这可以通过在 `backup.py` 中添加两个函数(`async_pre_backup`和`async_post_backup`)来完成。

## 添加支持

将备份支持添加到新的集成最快的方法是使用我们内置的脚手架模板。从 Home Assistant 的开发环境中，运行 `python3 -m script.scaffold backup` 并按照说明进行操作。

如果您更喜欢手动操作，请在集成文件夹中创建一个名为 `backup.py` 的文件，并实现以下方法：

```python
from homeassistant.core import HomeAssistant


async def async_pre_backup(hass: HomeAssistant) -> None:
    """Perform operations before a backup starts."""

async def async_post_backup(hass: HomeAssistant) -> None:
    """Perform operations after a backup finishes."""
```
