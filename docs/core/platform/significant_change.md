---
title: "重大变化"
---

Home Assistant 不仅收集数据，还会将数据导出到各种服务中。并非所有这些服务都对每个更改都感兴趣。为了帮助这些服务过滤不重要的更改，您的实体集成可以添加重要更改支持。

要添加此支持，请创建一个名为`significant_change.py`的平台文件，并在其中编写一个名为`async_check_significant_change`的函数。

```python
from typing import Any, Optional
from homeassistant.core import HomeAssistant, callback

@callback
def async_check_significant_change(
    hass: HomeAssistant,
    old_state: str,
    old_attrs: dict,
    new_state: str,
    new_attrs: dict,
    **kwargs: Any,
) -> bool | None:
```

此函数接收先前被认为是重要的状态和新状态。它不仅仅传递最后 2 个已知状态。该函数应返回一个布尔值，表示该状态是否重要，如果该函数无法确定，则返回`None`。

在确定重要性时，请确保考虑所有已知属性。使用设备类来区分实体类型。

以下是一些不重要更改的示例：

- 电池电量减少了 0.1%
- 温度传感器的温度变化了 0.1 摄氏度
- 灯的亮度变化了 2

Home Assistant 将自动处理`unknown`和`unavailable`等情况。

要为实体集成添加重要状态支持，请运行`python3 -m script.scaffold significant_change`。
