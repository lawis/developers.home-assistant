---
title: "Integration Services 集成服务"
sidebar_label: "Custom Services"
---

Home Assistant提供了大量准备好的服务，但并不总是覆盖所有功能。与其试图改变Home Assistant，最好是首先将其作为自己的集成服务添加进去。一旦我们在这些服务中看到了一种模式，我们就可以讨论将其泛化。

以下是一个简单的“Hello World”示例，演示了注册服务的基本原理。要使用这个示例，在 `<config dir>/custom_components/hello_service/__init__.py` 中创建文件，然后复制下面的示例代码进去。

服务可以从自动化中调用，也可以从前端中的“开发者工具”中的服务中调用。

```python
DOMAIN = "hello_service"

ATTR_NAME = "name"
DEFAULT_NAME = "World"


def setup(hass, config):
    """Set up is called when Home Assistant is loading our component."""

    def handle_hello(call):
        """Handle the service call."""
        name = call.data.get(ATTR_NAME, DEFAULT_NAME)

        hass.states.set("hello_service.hello", name)

    hass.services.register(DOMAIN, "hello", handle_hello)

    # Return boolean to indicate that initialization was successful.
    return True
```

在Home Assistant中加载集成需要创建一个 `manifest.json` 文件，并在 `configuration.yaml` 中添加一个条目。当您的组件被加载时，一个新的服务应该可用于调用。

```yaml
# configuration.yaml entry
hello_service:
```

An example of `manifest.json`:

```json
{
    "domain": "hello_service",
    "name": "Hello Service",
    "documentation": "https://developers.home-assistant.io/docs/dev_101_services",
    "iot_class": "local_push",
    "version": "0.1.0"
}
```

打开前端，在侧边栏中点击开发者工具部分的第一个图标。这将打开调用服务的开发者工具。在右侧，找到您的服务并点击它。这将自动填充正确的值。

现在按下“调用服务（Call Service）”按钮将调用您的服务，而不带任何参数。这将导致您的服务创建一个默认名称为“World”的状态。如果您想指定名称，您需要通过服务数据指定参数。在YAML模式下，添加以下内容，然后再次按下“调用服务”按钮。

```yaml
service: helloworld_service.hello
data:
  name: Planet
```

现在，该服务将使用“Planet”覆盖先前的状态。

## 服务描述

只有当用户了解这些服务时，添加服务才有用。在Home Assistant中，我们使用 `services.yaml` 作为您集成的一部分来描述这些服务。

服务以您集成的域名为发布名。因此，在 `services.yaml` 中，我们只使用服务名称作为基本键。

```yaml
# Example services.yaml entry

# Service ID
set_speed:
  # If the service accepts entity IDs, target allows the user to specify entities by
  # entity, device, or area. If `target` is specified, `entity_id` should not be
  # defined in the `fields` map. By default it shows only targets matching entities
  # from the same domain as the service, but if further customization is required,
  # target supports the entity, device, and area selectors
  # (https://www.home-assistant.io/docs/blueprint/selectors/). Entity selector
  # parameters will automatically be applied to device and area, and device selector
  # parameters will automatically be applied to area. 
  target:
    entity:
      domain: fan
      # If not all entities from the service's domain support a service, entities
      # can be further filtered by the `supported_features` state attribute. An
      # entity will only be possible to select if it supports at least one of the
      # listed supported features.
      supported_features:
        - fan.FanEntityFeature.SET_SPEED
        # If a service requires more than one supported feature, the item should
        # be given as a list of required supported features. For example, if the
        # service requires both SET_SPEED and OSCILLATE it would be expressed like this
        - - fan.FanEntityFeature.SET_SPEED
          - fan.FanEntityFeature.OSCILLATE
  # Different fields that your service accepts
  fields:
    # Key of the field
    speed:
      # Whether or not field is required (default = false)
      required: true
      # Advanced fields are only shown when the advanced mode is enabled for the user
      # (default = false)
      advanced: true
      # Example value that can be passed for this field
      example: "low"
      # The default field value
      default: "high"
      # Selector (https://www.home-assistant.io/docs/blueprint/selectors/) to control
      # the input UI for this field
      selector:
        select:
          translation_key: "fan_speed"
          options:
            - "off"
            - "low"
            - "medium"
            - "high"
```

:::info
The name and description of the services are set in our [translations](/docs/internationalization/core#services) and not in the service description. Each service and service field must have a matching translation defined.
:::

### 过滤服务字段

在某些情况下，服务的实体可能不支持所有的服务字段。通过为字段描述提供一个过滤器，只有至少有一个所选实体根据配置的过滤器支持该字段，该字段才会显示出来。

过滤器必须指定 `supported_features` 或 `attribute` 中的一个，不支持将两者结合使用。

一个 `supported_features` 过滤器由一组支持的特性列表组成。如果至少一个所选实体支持列表中的至少一个特性，该字段就会显示出来。

一个 `attribute` 过滤器将一个属性与一组值相结合。如果至少一个所选实体的属性设置为列表中的某个属性状态，该字段就会显示出来。如果属性状态是一个列表，如果所选实体的属性状态中至少有一项设置为列表中的某个属性状态，该字段就会显示出来。

以下是一个示例字段的部分代码，只有至少有一个所选实体支持 `ClimateEntityFeature.TARGET_TEMPERATURE` 时才会显示它：

```yaml
  fields:
    temperature:
      name: Temperature
      description: New target temperature for HVAC.
      filter:
        supported_features:
          - climate.ClimateEntityFeature.TARGET_TEMPERATURE
```
这是一个部分示例，仅当至少一个所选实体的 `supported_color_modes` 属性包括 `light.ColorMode.COLOR_TEMP` 或 `light.ColorMode.HS` 时才显示该字段。


```yaml
    color_temp:
      name: Color temperature
      description: Color temperature for the light in mireds.
      filter:
        attribute:
          supported_color_modes:
            - light.ColorMode.COLOR_TEMP
            - light.ColorMode.HS
```

## 实体服务

有时，您可能希望提供额外的服务来控制您的实体。例如，Sonos集成提供了用于分组和取消分组设备的服务。实体服务是特殊的，因为用户可以以多种不同的方式指定实体。它可以使用区域、一个分组或一组实体。

您需要在您的平台中注册实体服务，比如 `<your-domain>/media_player.py`。这些服务将在您的域下提供，而不是在媒体播放器域下。示例代码：

```python
from homeassistant.helpers import config_validation as cv, entity_platform, service

async def async_setup_entry(hass, entry):
    """Set up the media player platform for Sonos."""

    platform = entity_platform.async_get_current_platform()

    # This will call Entity.set_sleep_timer(sleep_time=VALUE)
    platform.async_register_entity_service(
        SERVICE_SET_TIMER,
        {
            vol.Required('sleep_time'): cv.time_period,
        },
        "set_sleep_timer",
    )
```

如果您需要对服务调用进行更多的控制，您也可以传递一个异步函数，而不是使用 "set_sleep_timer":

```python
async def custom_set_sleep_timer(entity, service_call):
    await entity.set_sleep_timer(service_call.data['sleep_time'])
```

## Response Data

Services may respond to a service call with data for powering more advanced automations. There are some additional implementation requirements:

- Response data must be a `dict` and serializable in JSON [`homeassistant.util.json.JsonObjectType`](https://github.com/home-assistant/home-assistant/blob/master/homeassistant/util/json.py) in order to interoperate with other parts of the system, such as the frontend.
- Errors must be raised as exceptions just like any other service call as we do
not want end users to need complex error handling in scripts and automations.
The response data should not contain error codes used for error handling.


## 响应数据

服务可能会对服务调用做出响应，以提供更高级的自动化功能。这里有一些额外的实现要求：

- 响应数据必须是一个`dict`并且可序列化为JSON [`homeassistant.util.json.JsonObjectType`](https://github.com/home-assistant/home-assistant/blob/master/homeassistant/util/json.py)，以便与系统的其他部分（如前端）进行交互操作。
- 错误必须像其他服务调用一样作为异常抛出，因为我们不希望最终用户在脚本和自动化中需要复杂的错误处理。响应数据不应包含用于错误处理的错误代码。


Example code:

```python
import datetime
import voluptuous as vol
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.helpers import config_validation as cv, entity_platform, service
from homeassistant.util.json import JsonObjectType


SEARCH_ITEMS_SERVICE_NAME = "search_items"
SEARCH_ITEMS_SCHEMA = vol.Schema({
    vol.Required("start"): datetime.datetime,
    vol.Required("end"): datetime.datetime,
})


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the platform."""

    async def search_items(call: ServiceCall) -> ServiceResponse:
        """Search in the date range and return the matching items."""
        items = await my_client.search(call.data["start"], call.data["end"])
        return {
            "items": [
                {
                    "summary": item["summary"],
                    "description": item["description"],
                } for item in items
            ],
        }

      hass.services.async_register(
          DOMAIN,
          SEARCH_ITEMS_SERVICE_NAME,
          search_items,
          schema=SEARCH_ITEMS_SCHEMA,
          supports_response=SupportsResponse.ONLY,
      )
```

使用响应数据的目的是处理不适用于Home Assistant状态的情况。例如，对象的响应流。相反，对于适用于实体状态的情况，不应该使用响应数据。例如，温度值应该作为一个传感器来处理。


### 支持响应数据

服务调用注册时使用 `SupportsResponse` 值来指示是否支持响应数据。

| 值         | 描述                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPTIONAL` | 该服务执行一个动作，并且可以选择性地返回响应数据。服务应有条件地检查 `ServiceCall` 属性 `return_response`，以决定是否返回响应数据，或者返回 `None`。 |
| `ONLY`     | 该服务不执行任何操作，并且总是返回响应数据。                                                                                                                                                                           |