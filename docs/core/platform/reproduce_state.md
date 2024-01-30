---
title: "重现状态"
---

Home Assistant 支持场景。场景是（部分）实体状态的集合。当激活场景时，Home Assistant 将尝试调用正确的服务以使指定的场景处于指定的状态。

集成负责为 Home Assistant 添加支持，以便能够调用正确的服务来还原场景中的状态。

## 添加支持

向新的集成添加还原状态支持的最快方法是使用我们内置的脚手架模板。从 Home Assistant 开发环境中，运行`python3 -m script.scaffold reproduce_state`并按照说明操作。

如果您更喜欢手动操作，可以在集成文件夹中创建一个名为`reproduce_state.py`的新文件，并实现以下方法：

```python
import asyncio
from typing import Iterable, Optional
from homeassistant.core import Context, HomeAssistant, State


async def async_reproduce_states(
    hass: HomeAssistant, states: Iterable[State], context: Optional[Context] = None
) -> None:
    """Reproduce component states."""
    # TODO reproduce states
```
