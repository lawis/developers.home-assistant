---
title: "Networking and Discovery 网络发现"
sidebar_label: "Networking and Discovery"
---

某些集成可能需要在启用后通过[mDNS/Zeroconf](https://en.wikipedia.org/wiki/Zero-configuration_networking)、[SSDP](https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol)或其他方法发现网络上的设备。主要用例是查找没有已知固定 IP 地址的设备，或者用于可以动态添加和删除任意数量的兼容可发现设备的集成。

Home Assistant 内置了用于支持 mDNS/Zeroconf 和 SSDP 的帮助函数。如果您的集成使用其他发现方法，并且需要确定使用哪些网络接口来广播流量，[Network](https://www.home-assistant.io/integrations/network/) 集成提供了一个帮助函数 API，用于访问用户的接口首选项。

## mDNS/Zeroconf

Home Assistant 使用 [python-zeroconf](https://github.com/python-zeroconf/python-zeroconf) 包来支持 mDNS。由于在单个主机上运行多个 mDNS 实现并不推荐，因此 Home Assistant 提供了内部帮助函数 API 来访问运行中的 `Zeroconf` 和 `AsyncZeroconf` 实例。

在使用这些帮助函数之前，请确保在您的集成的 [`manifest.json`](creating_integration_manifest.md) 中的 `dependencies` 中添加了 `zeroconf`。


### Obtaining the `AsyncZeroconf` object

```python
from homeassistant.components import zeroconf

...
aiozc = await zeroconf.async_get_async_instance(hass)

```

### Obtaining the `Zeroconf` object

```python
from homeassistant.components import zeroconf

...
zc = await zeroconf.async_get_instance(hass)

```

### Using the `AsyncZeroconf` and `Zeroconf` objects

`python-zeroconf` provides examples on how to use both objects [examples](https://github.com/jstasiak/python-zeroconf/tree/master/examples).

## SSDP

Home Assistant provides built-in discovery via SSDP.

Before using these helpers, be sure to add `ssdp` to `dependencies` in your integration's [`manifest.json`](creating_integration_manifest.md)



SSDP代表Simple Service Discovery Protocol，是一种网络协议，用于设备之间的服务发现。Home Assistant提供了内置的SSDP发现功能。

在使用这些辅助函数之前，确保在集成的 [`manifest.json`](creating_integration_manifest.md) 文件中的 `dependencies` 中添加了 `ssdp`。

### 获取已发现设备的列表

可以使用以下内置的辅助API来获取已发现的SSDP设备列表。SSDP集成提供了以下辅助API来从缓存中查找现有的SSDP发现: `ssdp.async_get_discovery_info_by_udn_st`，`ssdp.async_get_discovery_info_by_st`，`ssdp.async_get_discovery_info_by_udn`。

### 查找特定设备

`ssdp.async_get_discovery_info_by_udn_st` API在提供`SSDP`、`UDN`和`ST`时返回单个`discovery_info`或`None`。

```python
from homeassistant.components import ssdp

...

discovery_info = await ssdp.async_get_discovery_info_by_udn_st(hass, udn, st)
```

### 通过`ST`查找设备

如果要查找特定类型的已发现设备，调用`ssdp.async_get_discovery_info_by_st`将返回与`SSDP` `ST`匹配的所有已发现设备的列表。下面的示例返回网络上发现的每个Sonos播放器的发现信息列表。

```python
from homeassistant.components import ssdp

...

discovery_infos = await ssdp.async_get_discovery_info_by_st(hass, "urn:schemas-upnp-org:device:ZonePlayer:1")
for discovery_info in discovery_infos:
  ...

```

### 通过`UDN`查找设备

如果要查看特定`UDN`提供的服务列表，调用`ssdp.async_get_discovery_info_by_udn`将返回与`UPNP` `UDN`匹配的所有已发现设备的列表。

```python
from homeassistant.components import ssdp

...

discovery_infos = await ssdp.async_get_discovery_info_by_udn(hass, udn)
for discovery_info in discovery_infos:
  ...

```

### 订阅SSDP发现

有些集成可能需要立即了解何时发现了一个设备。SSDP集成提供了一个注册API，用于在发现与特定键值匹配的新设备时接收回调。与 `manifest.json` 中的 `ssdp` 匹配使用相同的格式。

提供了 `ssdp.async_register_callback` 函数来实现此能力。该函数返回一个回调函数，在调用时会取消注册。

下面的示例显示了注册回调函数以在网络上发现Sonos播放器时收到回调的方式。

```python
from homeassistant.components import ssdp

...

entry.async_on_unload(
    ssdp.async_register_callback(
        hass, _async_discovered_player, {"st": "urn:schemas-upnp-org:device:ZonePlayer:1"}
    )
)
```

下面的示例显示了在存在 `x-rincon-bootseq` 头部时注册回调函数的方式。

```python
from homeassistant.components import ssdp
from homeassistant.const import MATCH_ALL

...

entry.async_on_unload(
    ssdp.async_register_callback(
        hass, _async_discovered_player, {"x-rincon-bootseq": MATCH_ALL}
    )
)
```

## 网络

对于使用未内置的发现方法并需要访问用户的网络适配器配置的集成，应使用以下辅助API。

```python
from homeassistant.components import network

...
adapters = await network.async_get_adapters(hass)
```

### `async_get_adapters` 示例数据结构

```python
[
    {   
        "auto": True,
        "default": False,
        "enabled": True,
        "ipv4": [],
        "ipv6": [
            {   
                "address": "2001:db8::",
                "network_prefix": 8,
                "flowinfo": 1,
                "scope_id": 1,
            }
        ],
        "name": "eth0",
    },
    {
        "auto": True,
        "default": False,
        "enabled": True,
        "ipv4": [{"address": "192.168.1.5", "network_prefix": 23}],
        "ipv6": [],
        "name": "eth1",
    },
    {
        "auto": False,
        "default": False,
        "enabled": False,
        "ipv4": [{"address": "169.254.3.2", "network_prefix": 16}],
        "ipv6": [],
        "name": "vtun0",
    },
]
```

### 从适配器获取IP网络

```python
from ipaddress import ip_network
from homeassistant.components import network

...

adapters = await network.async_get_adapters(hass)

for adapter in adapters:
    for ip_info in adapter["ipv4"]:
        local_ip = ip_info["address"]
        network_prefix = ip_info["network_prefix"]
        ip_net = ip_network(f"{local_ip}/{network_prefix}", False)
```

## USB

USB集成会在启动时、访问集成页面时以及插入USB设备时（如果底层系统支持 `pyudev`）自动发现新的USB设备。

### 检查特定适配器是否已插入

调用 `async_is_plugged_in` API 来检查系统上是否已连接特定适配器。

```python
from homeassistant.components import usb

...

if not usb.async_is_plugged_in(hass, {"serial_number": "A1234", "manufacturer": "xtech"}):
   raise ConfigEntryNotReady("The USB device is missing")

```

### 知道何时查找新的兼容USB设备

调用 `async_register_scan_request_callback` API 来请求在可能有新的兼容USB设备可用时收到的回调。

```python
from homeassistant.components import usb
from homeassistant.core import callback

...

@callback
def _async_check_for_usb() -> None:
    """Check for new compatible bluetooth USB adapters."""

entry.async_on_unload(
    bluetooth.async_register_scan_request_callback(hass, _async_check_for_usb)
)
```