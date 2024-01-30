---
title: "Validate the input"
---

`configuration.yaml` 文件包含组件和平台的配置选项。我们使用 [voluptuous](https://pypi.python.org/pypi/voluptuous) 来确保用户提供的配置有效。有些条目是可选的，或者可能需要设置平台或组件。另一些必须是定义过的类型或从已定义的列表中选择。

我们测试配置以确保用户的良好体验，并在 Home Assistant 运行之前最小化有关平台或组件设置是否有问题的通知。

除了 [voluptuous](https://pypi.python.org/pypi/voluptuous) 默认类型之外，还有许多自定义类型可用。有关概述，请查看 [config_validation.py](https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/config_validation.py) 帮助程序。

- 类型：`string`、`byte`、`boolean`。
- 实体 ID：`entity_id` 和 `entity_ids`。
- 数字：`small_float` 和 `positive_int`。
- 时间：`time`、`time_zone`。
- 杂项：`template`、`slug`、`temperature_unit`、`latitude`、`longitude`、`isfile`、`sun_event`、`ensure_list`、`port`、`url` 和 `icon`。

要使用 [MQTT](https://www.home-assistant.io/components/mqtt/) 验证平台，可以使用 `valid_subscribe_topic` 和 `valid_publish_topic`。

需要记住的一些事情：

- 使用 `const.py` 中定义的常量。
- 从集成您正在集成的地方导入 `PLATFORM_SCHEMA` 并进行扩展。
- 推荐的顺序是先 `required`，然后是 `optional`。
- 可选配置键的默认值必须是有效值。不要使用 `None` 作为默认值，如 `vol.Optional(CONF_SOMETHING, default=None): cv.string`，如果需要，则将默认值设置为 `default=''`。


### Snippets

本节包含我们使用的验证片段。

#### 默认名称

如果用户没有提供名称，通常会为传感器设置一个默认值。

```python
DEFAULT_NAME = "Sensor name"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        # ...
        vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    }
)
```


#### 限制值

您可能希望将用户的输入限制为几个选项。

```python
DEFAULT_METHOD = "GET"

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        # ...
        vol.Optional(CONF_METHOD, default=DEFAULT_METHOD): vol.In(["POST", "GET"]),
    }
)
```

#### 端口

所有端口号都在1到65535的范围内。

```python
DEFAULT_PORT = 993

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        # ...
        vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    }
)
```

#### Lists

如果传感器具有预定义的可用选项列表，则测试以确保配置条目与列表匹配。
```python
SENSOR_TYPES = {
    "article_cache": ("Article Cache", "MB"),
    "average_download_rate": ("Average Speed", "MB/s"),
}

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        # ...
        vol.Optional(CONF_MONITORED_VARIABLES, default=[]): vol.All(
            cv.ensure_list, [vol.In(SENSOR_TYPES)]
        ),
    }
)
```
