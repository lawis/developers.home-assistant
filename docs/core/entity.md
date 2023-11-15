---
title: Entity
sidebar_label: Introduction
---

有关实体的通用介绍，请参见[实体架构](../architecture/devices-and-services.md)。

## 基本实现

下面是一个示例开关实体，它会在内存中跟踪其状态。此外，该示例中的开关表示设备的主要功能，这意味着该实体与其设备具有相同的名称。

有关如何为实体命名的信息，请参见[实体命名](#entity-naming)。


```python
from homeassistant.components.switch import SwitchEntity


class MySwitch(SwitchEntity):
    _attr_has_entity_name = True

    def __init__(self):
        self._is_on = False
        self._attr_device_info = ...  # For automatic device registration
        self._attr_unique_id = ...

    @property
    def is_on(self):
        """If the switch is currently on or off."""
        return self._is_on

    def turn_on(self, **kwargs):
        """Turn the switch on."""
        self._is_on = True

    def turn_off(self, **kwargs):
        """Turn the switch off."""
        self._is_on = False
```

构建开关实体就是这样！继续阅读以了解更多信息，或查看[视频教程](https://youtu.be/Cfasc9EgbMU?t=737)。

## 更新实体

实体代表一个设备。有多种策略可以让您的实体与设备的状态保持同步，其中最常用的一种是轮询。

### 轮询

使用轮询，Home Assistant会不时地询问实体（取决于组件的更新间隔）以获取最新状态。当`should_poll`属性返回`True`时（默认值），Home Assistant会对实体进行轮询。您可以使用`update()`或异步方法`async_update()`来实现更新逻辑。该方法应该从设备中获取最新状态，并将其存储在实例变量中，以便属性可以返回它。

### 订阅更新

当您订阅更新时，您的代码负责让Home Assistant知道更新可用。确保将`should_poll`属性返回`False`。

每当您从订阅中收到新状态时，您可以通过调用`schedule_update_ha_state()`或异步回调`async_schedule_update_ha_state()`告知Home Assistant更新可用。如果想要Home Assistant在将更新写入之前调用您的更新方法，将布尔值`True`传递给该方法。

## 通用属性

实体基类在Home Assistant中的所有实体中具有几个共有属性。这些属性可以添加到任何类型的实体中，不管其类型如何。所有这些属性都是可选的，不需要实现。

:::tip
属性应始终仅从内存返回信息，而不进行I/O操作（如网络请求）。实现`update()`或`async_update()`来获取数据。

这是一段关于实体属性的英文描述，讲述了不同属性的类型、默认值和描述。我将其翻译如下：

| 名称                    | 类型    | 默认值 | 描述                                                                                                                                                                                                                                                  |
| ----------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| assumed_state           | 布尔型 | `False` | 如果状态是基于我们的假设而不是从设备中读取的，则返回`True`。 |
| attribution             | 字符串  | `None`  | API提供商要求的品牌文字。 |
| available               | 布尔型 | `True`  | 表示Home Assistant是否能够读取状态并控制底层设备。 |
| device_class            | 字符串  | `None`  | 设备的额外分类。每个域都会指定自己的分类。设备类别可能会带有有关测量单位和支持功能的额外要求。 |
| device_info             | 字典    | `None`  | [设备注册表](/docs/device_registry_index)中的描述符，用于[自动设备注册。](/docs/device_registry_index#automatic-registration-through-an-entity)
| entity_category         | 字符串  | `None`  | 非主要实体的分类。设置为`EntityCategory.CONFIG`表示允许更改设备配置的实体，例如，一个开关实体可以控制开关背景灯光的实体。设置为`EntityCategory.DIAGNOSTIC`表示公开设备的某些配置参数或诊断信息的实体，但不允许更改，例如，显示RSSI或MAC地址的传感器。 |
| entity_picture          | URL     | `None`  | 显示实体图片的URL。 |
| extra_state_attributes  | 字典    | `None`  | 存储在状态机中的额外信息。这些信息应该进一步解释状态，而不是固定的信息，例如固件版本。 |
| has_entity_name         | 布尔型 |         | 如果实体的`name`属性表示实体本身（新集成所需），则返回`True`。具体细节将在下面详细解释。
| name                    | 字符串  | `None`  | 实体的名称。避免硬编码自然语言名称，而是使用[已翻译名称](/docs/internationalization/core/#name-of-entities)。  |
| should_poll             | 布尔型 | `True`  | Home Assistant是否应检查实体是否有更新的状态。如果设置为`False`，实体将需要通过调用其中一个[更新调度方法](integration_fetching_data.md#push-vs-poll)来通知Home Assistant有新的更新。
| translation_key         | 字符串  | `None`  | 用于查找实体状态的翻译的关键词[`integration's` strings.json`中的`entity`部分`](/docs/internationalization/core#state-of-entities)。
| unique_id               | 字符串  | `None`  | 该实体的唯一标识符。在平台内必须是唯一的（例如`light.hue`）。不应该由用户进行配置或更改。[了解更多。](entity_registry_index.md#unique-id-requirements) |

:::warning
生成大量状态变化的实体，在`extra_state_attributes`频繁变化时会快速增加数据库的大小。通过去除非关键属性或创建额外的`sensor`实体，最小化这些实体的`extra_state_attributes`数量。
:::

## Advanced properties

The following properties are also available on entities. However, they are for advanced use only and should be used with caution.

| Name                            | Type    | Default | Description                                                                                                                                                                                                           |
| ------------------------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity_registry_enabled_default | boolean | `True`  | Indicate if the entity should be enabled or disabled when first added to the entity registry. This includes fast-changing diagnostic entities or, assumingly less commonly used entities. For example, a sensor exposing RSSI or battery voltage should typically be set to `False`; to prevent unneeded (recorded) state changes or UI clutter by these entities. |
| entity_registry_visible_default | boolean | `True`  | Indicate if the entity should be hidden or visible when first added to the entity registry. |
| force_update                    | boolean | `False` | Write each update to the state machine, even if the data is the same. Example use: when you are directly reading the value from a connected sensor instead of a cache. Use with caution, will spam the state machine. |
| icon                            | icon    | `None`  | Icon to use in the frontend. Icons start with `mdi:` plus an [identifier](https://materialdesignicons.com/). You probably don't need this since Home Assistant already provides default icons for all entities according to its `device_class`. This should be used only in the case where there either is no matching `device_class` or where the icon used for the `device_class` would be confusing or misleading. |

## System properties

The following properties are used and controlled by Home Assistant, and should not be overridden by integrations.

| Name    | Type    | Default | Description                                                                                                                                                                              |
| ------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled | boolean | `True`  | Indicate if entity is enabled in the entity registry. It also returns `True` if the platform doesn't support the entity registry. Disabled entities will not be added to Home Assistant. |

## 实体命名

避免将实体的名称设置为硬编码的英文字符串，而应进行翻译。不需要进行翻译的情况包括专有名词、型号名称和第三方库提供的名称。

有些实体会根据其设备类自动生成名称，包括[`binary_sensor`](/docs/core/entity/binary-sensor)、[`button`](/docs/core/entity/button)、[`number`](/docs/core/entity/number)和[`sensor`](/docs/core/entity/sensor)实体，在许多情况下不需要命名。例如，一个没有命名的传感器，其设备类设置为`temperature`，将被命名为"Temperature"。

`has_entity_name`为True（对于新的集成是强制的）

实体的名称属性仅标识实体所表示的数据点，不应包含设备的名称或实体的类型。因此，对于表示设备功耗的传感器，其名称应为"Power usage"。

如果实体代表设备的单个主要功能，则实体的名称属性通常应返回`None`。设备的主要功能可能是智能灯泡的`LightEntity`。

`friendly_name`状态属性是通过将实体名称与设备名称组合生成的，具体如下：
- 实体不是设备的成员：`friendly_name = entity.name`
- 实体是设备的成员且`entity.name`不为`None`：`friendly_name = f"{device.name} {entity.name}"`
- 实体是设备的成员且`entity.name`为`None`：`friendly_name = f"{device.name}"`

实体名称应以大写字母开头，其余单词应为小写字母（除非是专有名词或首字母缩写）。

以下是设备的主要功能开关实体的示例：

*注意：此示例使用类属性来实现属性，其他实现属性的方式请参阅[属性实现](#property-implementation)。*
*注意：此示例不完整，必须实现`unique_id`属性，并且实体必须[注册到设备中](/docs/device_registry_index#defining-devices)。

```python
from homeassistant.components.switch import SwitchEntity


class MySwitch(SwitchEntity):
    _attr_has_entity_name = True
    _attr_name = None

```

#### Example of a switch entity which is either not the main feature of a device, or is not part of a device:

*Note: The example is using class attributes to implement properties, for other ways*
*to implement properties see [Property implementation.](#property-implementation)*
*Note: If the entity is part of a device, the `unique_id` property must be implemented, and the entity
must be [registered with a device.](/docs/device_registry_index#defining-devices)

```python
from homeassistant.components.switch import SwitchEntity


class MySwitch(SwitchEntity):
    _attr_has_entity_name = True

    @property
    def translation_key(self):
        """Return the translation key to translate the entity's name and states."""
        return my_switch
```

#### Example of an untranslated switch entity which is either not the main feature of a device, or is not part of a device:

```python
from homeassistant.components.switch import SwitchEntity


class MySwitch(SwitchEntity):
    _attr_has_entity_name = True

    @property
    def name(self):
        """Name of the entity."""
        return "Model X"
```

### `has_entity_name` not implemented or False (Deprecated)

The entity's name property may be a combination of the device name and the data point represented by the entity.

## Property implementation

### Property function

Writing property methods for each property is just a couple of lines of code,
for example

```python
class MySwitch(SwitchEntity):

    @property
    def icon(self) -> str | None:
        """Icon of the entity."""
        return "mdi:door"

    ...
```

### Entity class or instance attributes

Alternatively, a shorter form is to set Entity class or instance attributes according to either of the
following patterns:

```python
class MySwitch(SwitchEntity):

    _attr_icon = "mdi:door"

    ...
```

```python
class MySwitch(SwitchEntity):

    def __init__(self, icon: str) -> None:
        self._attr_icon = icon

    ...
```

This does exactly the same as the first example but relies on a default 
implementation of the property in the base class. The name of the attribute
starts with `_attr_` followed by the property name. For example, the default
`device_class` property returns the `_attr_device_class` class attribute.

Not all entity classes support the `_attr_` attributes for their entity 
specific properties, please refer to the documentation for the respective 
entity class for details.

:::tip
If an integration needs to access its own properties it should access the property (`self.name`), not the class or instance attribute (`self._attr_name`).
:::

### Example

The below code snippet gives an example of best practices for when to implement property functions, and when to use class or instance attributes.

```py
class SomeEntity():
    _attr_device_class = SensorDeviceClass.TEMPERATURE  # This will be common to all instances of SomeEntity
    def __init__(self, device):
        self._device = device
        self._attr_available = False  # This overrides the default
        self._attr_name = device.get_friendly_name()

        # The following should be avoided:
        if some_complex_condition and some_other_condition and something_is_none_and_only_valid_after_update and device_available:
           ...

    def update(self)
        if self.available  # Read current state, no need to prefix with _attr_
            # Update the entity
            self._device.update()

        if error:
            self._attr_available = False  # Set property value
            return
        # We don't need to check if device available here
        self._attr_is_on = self._device.get_state()  # Update "is_on" property
```

## Lifecycle hooks

Use these lifecycle hooks to execute code when certain events happen to the entity. All lifecycle hooks are async methods.

### `async_added_to_hass()`

Called when an entity has their entity_id and hass object assigned, before it is written to the state machine for the first time. Example uses: restore the state, subscribe to updates or set callback/dispatch function/listener.

### `async_will_remove_from_hass()`

Called when an entity is about to be removed from Home Assistant. Example use: disconnect from the server or unsubscribe from updates.

## Changing the entity model

If you want to add a new feature to an entity or any of its subtypes (light, switch, etc), you will need to propose it first in our [architecture repo](https://github.com/home-assistant/architecture/discussions). Only additions will be considered that are common features among various vendors.
