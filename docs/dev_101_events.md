---
title: "Events"
---

Home Assistant 的核心是由事件驱动的。这意味着如果您想要对某些事情作出响应，您将需要对事件作出响应。大多数情况下，您不会直接与事件系统交互，而是使用其中一个 [事件监听器助手][helpers]。

事件系统非常灵活。对于事件类型，没有任何限制，只要它是一个字符串即可。每个事件都可以包含数据。数据是一个字典，只要它是可以以 JSON 进行序列化的，就可以包含任何数据。这意味着您可以使用数字、字符串、字典和列表。

[Home Assistant 触发的事件列表][object]。

## 触发事件

要触发一个事件，您需要与事件总线进行交互。事件总线可在 Home Assistant 实例中通过 `hass.bus` 访问。请注意，我们的 [Data Science 门户网站](https://data.home-assistant.io/docs/events/#database-table) 文档中有关数据结构的说明。

以下是一个示例组件，在加载时将触发一个事件。请注意，自定义事件名称带有组件名称的前缀。


```python
DOMAIN = "example_component"


def setup(hass, config):
    """Set up is called when Home Assistant is loading our component."""

    # Fire event example_component_my_cool_event with event data answer=42
    hass.bus.fire("example_component_my_cool_event", {"answer": 42})

    # Return successful setup
    return True
```

## 监听事件

大多数情况下，您不会触发事件，而是监听事件。例如，一个实体的状态更改就会以事件的形式广播。

```python
DOMAIN = "example_component"


def setup(hass, config):
    """Set up is called when Home Assistant is loading our component."""
    count = 0

    # Listener to handle fired events
    def handle_event(event):
        nonlocal count
        count += 1
        print(f"Answer {count} is: {event.data.get('answer')}")

    # Listen for when example_component_my_cool_event is fired
    hass.bus.listen("example_component_my_cool_event", handle_event)

    # Return successful setup
    return True
```

### Helpers

Home Assistant comes with a lot of bundled helpers to listen to specific types of event. There are helpers to track a point in time, to track a time interval, a state change or the sun set. [See available methods.][helpers]

[helpers]: https://dev-docs.home-assistant.io/en/dev/api/helpers.html#module-homeassistant.helpers.event
[object]: https://www.home-assistant.io/docs/configuration/events/
