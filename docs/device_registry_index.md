---
title: Device Registry 设备注册
---

设备注册表是 Home Assistant 用来跟踪设备的注册表。设备通过一个或多个实体在 Home Assistant 中进行表示。例如，一个使用电池供电的温湿度传感器可能会公开温度、湿度和电池电量等实体。
<img class='invertDark'
  src='/img/en/device_registry/overview.png'
  alt='Device registry overview'
/>

## What is a device?

在Home Assistant中，设备表示一个具有自己控制单元的物理设备或一个服务。控制单元本身不一定是智能的，但它应该能够控制发生的事件。例如，带有4个房间传感器的Ecobee恒温器在Home Assistant中等同于5个设备，一个用于恒温器以及其中的所有传感器，另外四个分别用于每个房间的传感器。每个设备存在于特定的地理区域，并且在该区域内可能有多个输入或输出。

如果您将传感器连接到另一个设备以读取部分数据，它仍应被表示为两个不同的设备。原因是传感器可能被移动以读取另一个设备的数据。

一个设备提供多个端点，在这些端点中设备的部分感知或输出在不同的区域，应该被拆分为单独的设备，并使用 `via_device` 属性引用回父设备。这样可以将独立的端点分配给建筑物中的不同区域。

:::info
虽然目前尚不可用，但我们可以考虑向用户提供合并设备的选项。
:::

## Device properties

| 属性                     | 描述                                                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| area_id                | 设备所在的区域。                                                                                                                                                                                                                         |
| config_entries         | 与此设备相关联的配置项。                                                                                                                                                                                                              |
| configuration_url      | 设备或服务的配置URL，可以使用 `homeassistant://<path>` 来链接到Home Assistant UI中的路径。                                                                                                                                                      |
| connections            | 一组元组，格式为 `(连接类型，连接标识符)`。连接类型在设备注册模块中定义。                                                                                                                                                                      |
| default_manufacturer   | 设备的制造商，如果设置了 `manufacturer` 属性，则会被覆盖。对于显示网络上所有设备的集成化，这是非常有用的。                                                                                                                                                   |
| default_model          | 设备的型号，如果设置了 `model` 属性，则会被覆盖。对于显示网络上所有设备的集成化，这是非常有用的。                                                                                                                                                      |
| default_name           | 设备的默认名称，如果设置了 `name` 属性，则会被覆盖。对于显示网络上所有设备的集成化，这是非常有用的。                                                                                                                                                         |
| entry_type             | 条目的类型。可能的值有 `None` 和 `DeviceEntryType` 枚举成员（仅限 `service`）。                                                                                                                                                                |
| hw_version             | 设备的硬件版本。                                                                                                                                                                                                                          |
| id                     | 设备的唯一ID（由Home Assistant生成）。                                                                                                                                                                                                      |
| identifiers            | 一组 `(DOMAIN，标识符)` 元组。标识符用于在外部世界中识别设备。一个例子是序列号。                                                                                                                                                                    |
| name                   | 设备的名称。                                                                                                                                                                                                                              |
| name_by_user           | 用户配置的设备名称。                                                                                                                                                                                                                      |
| manufacturer           | 设备的制造商。                                                                                                                                                                                                                            |
| model                  | 设备的型号。                                                                                                                                                                                                                              |
| suggested_area         | 设备所在区域的建议名称。                                                                                                                                                                                                                  |
| sw_version             | 设备的固件版本。                                                                                                                                                                                                                          |
| via_device             | 在此设备和Home Assistant之间路由消息的设备的标识符。这种设备的示例包括中心设备或子设备的父设备。这用于在Home Assistant中显示设备拓扑。                                                                                                                                             |

## Defining devices

### Automatic registration through an entity
:::tip
Entity device info is only read if the entity is loaded via a [config entry](config_entries_index.md) and the `unique_id` property is defined.
:::

每个实体都可以通过 `device_info` 属性定义设备。当实体通过配置条目添加到Home Assistant时，将读取此属性。设备将通过提供的标识符或连接（如序列号或MAC地址）与现有设备匹配。如果提供了标识符和连接，设备注册表将首先尝试通过标识符进行匹配。每个标识符和每个连接都将被单独匹配（例如，只需一个连接匹配即被视为同一设备）。

```python
# Inside a platform
class HueLight(LightEntity):
    @property
    def device_info(self) -> DeviceInfo:
        """Return the device info."""
        return DeviceInfo(
            identifiers={
                # Serial numbers are unique identifiers within a specific domain
                (hue.DOMAIN, self.unique_id)
            },
            name=self.name,
            manufacturer=self.light.manufacturername,
            model=self.light.productname,
            sw_version=self.light.swversion,
            via_device=(hue.DOMAIN, self.api.bridgeid),
        )
```

除了设备属性之外，`device_info` 还可以包括 `default_manufacturer`、`default_model` 和 `default_name`。如果尚未定义其他值，这些值将添加到设备注册表中。这可以被某些集成使用，它们了解一些信息但不是非常具体。例如，基于MAC地址识别设备的路由器。

### 手动注册

在没有代表它们的实体的情况下，组件也可以注册设备。一个示例是与灯通信的中心。


```python
# Inside a component
from homeassistant.helpers import device_registry as dr

device_registry = dr.async_get(hass)

device_registry.async_get_or_create(
    config_entry_id=entry.entry_id,
    connections={(dr.CONNECTION_NETWORK_MAC, config.mac)},
    identifiers={(DOMAIN, config.bridgeid)},
    manufacturer="Signify",
    suggested_area="Kitchen",
    name=config.name,
    model=config.modelid,
    sw_version=config.swversion,
    hw_version=config.hwversion,
)
```

## Removing devices

集成可以选择允许用户从用户界面中删除设备。要实现这一点，集成应在其 `__init__.py` 模块中实现函数 `async_remove_config_entry_device`。

```py
async def async_remove_config_entry_device(
    hass: HomeAssistant, config_entry: ConfigEntry, device_entry: DeviceEntry
) -> bool:
    """Remove a config entry from a device."""
```

当用户点击设备的删除按钮并确认后，将等待 `async_remove_config_entry_device` 函数的执行，如果返回 `True`，则将从设备中删除配置条目。如果这是设备的唯一配置条目，则将从设备注册表中删除该设备。

在 `async_remove_config_entry_device` 中，集成应采取必要的步骤准备删除设备，并在成功时返回 `True`。如果使用 `async_remove_config_entry_device` 进行清理不方便，集成可以选择在 `EVENT_DEVICE_REGISTRY_UPDATED` 上进行操作。