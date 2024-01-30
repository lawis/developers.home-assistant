---
title: "Bluetooth APIs"
---

### 订阅蓝牙发现

某些集成可能需要立即知道设备被发现的情况。蓝牙集成提供了一个注册 API，用于在发现与特定关键值匹配的新设备时接收回调。与 [`manifest.json`](../../creating_integration_manifest#bluetooth) 中的 `bluetooth` 相同的格式用于匹配。除了在 `manifest.json` 中使用的匹配器之外，`address` 也可以用作匹配器。

提供了函数 `bluetooth.async_register_callback` 来实现此功能。该函数返回一个回调函数，当调用时将取消注册。

下面的示例显示了注册以在附近有 Switchbot 设备时获取回调的方法。


```python
from homeassistant.components import bluetooth

...

@callback
def _async_discovered_device(service_info: bluetooth.BluetoothServiceInfoBleak, change: bluetooth.BluetoothChange) -> None:
    """Subscribe to bluetooth changes."""
    _LOGGER.warning("New service_info: %s", service_info)

entry.async_on_unload(
    bluetooth.async_register_callback(
        hass, _async_discovered_device, {"service_uuid": "cba20d00-224d-11e6-9fb8-0002a5d5c51b", "connectable": False}, bluetooth.BluetoothScanningMode.ACTIVE
    )
)
```

The below example shows registering to get callbacks for HomeKit devices.

```python
from homeassistant.components import bluetooth

...

entry.async_on_unload(
    bluetooth.async_register_callback(
        hass, _async_discovered_homekit_device, {"manufacturer_id": 76, "manufacturer_data_first_byte": 6}, bluetooth.BluetoothScanningMode.ACTIVE
    )
)
```

The below example shows registering to get callbacks for Nespresso Prodigios.

```python
from homeassistant.components import bluetooth

...

entry.async_on_unload(
    bluetooth.async_register_callback(
        hass, _async_nespresso_found, {"local_name": "Prodigio_*")}, bluetooth.BluetoothScanningMode.ACTIVE
    )
)
```

The below example shows registering to get callbacks for a device with the address `44:33:11:22:33:22`.

```python
from homeassistant.components import bluetooth

...

entry.async_on_unload(
    bluetooth.async_register_callback(
        hass, _async_specific_device_found, {"address": "44:33:11:22:33:22")}, bluetooth.BluetoothScanningMode.ACTIVE
    )
)
```

### Fetch the shared BleakScanner instance

Integrations that need an instance of a `BleakScanner` should call the `bluetooth.async_get_scanner` API. This API returns a wrapper around a single `BleakScanner` that allows integrations to share without overloading the system.

```python
from homeassistant.components import bluetooth

scanner = bluetooth.async_get_scanner(hass)
```


### 判断扫描程序是否正在运行

蓝牙集成可能已经设置，但没有可连接的适配器或远程设备。可以使用 `bluetooth.async_scanner_count` API 来确定是否有正在运行的扫描程序，该程序将能够接收广告或生成可用于连接到设备的 `BLEDevice`。如果没有扫描程序将生成可连接的 `BLEDevice` 对象，集成可能希望在设置过程中引发一个更有帮助的错误。

```python
from homeassistant.components import bluetooth

count = bluetooth.async_scanner_count(hass, connectable=True)
```

### 订阅不可用回调

要在蓝牙堆栈无法再看到设备时获得回调，调用 `bluetooth.async_track_unavailable` API。出于性能原因，一旦设备不再可见，可能需要多达五分钟才能获得回调。

如果将 `connectable` 参数设置为 `True`，如果任何可连接的控制器可以访问设备，则将认为该设备是可用的。如果只有不可连接的控制器可以访问设备，则认为该设备是不可用的。如果将参数设置为 `False`，则只要任何控制器可以看到设备，就认为该设备是可用的。

```python
from homeassistant.components import bluetooth

def _unavailable_callback(info: bluetooth.BluetoothServiceInfoBleak) -> None:
    _LOGGER.debug("%s is no longer seen", info.address)

cancel = bluetooth.async_track_unavailable(hass, _unavailable_callback, "44:44:33:11:23:42", connectable=True)
```

### 通过 `address` 获取 bleak 的 `BLEDevice`

集成应避免开启额外的扫描器来解析地址的开销，可以通过调用 `bluetooth.async_ble_device_from_address` API 来获取最接近配置的 `bluetooth` 适配器能够访问的设备的 `BLEDevice`。如果没有适配器能够访问该设备，`bluetooth.async_ble_device_from_address` API 将返回 `None`。

假设集成希望从 `connectable` 和非连接控制器接收数据，那么在需要建立输出连接时，可以将 `BLEDevice` 替换为 `connectable` 的设备，只要至少有一个 `connectable` 的控制器在范围内。

```python
from homeassistant.components import bluetooth

ble_device = bluetooth.async_ble_device_from_address(hass, "44:44:33:11:23:42", connectable=True)
```

### 获取设备的最新 `BluetoothServiceInfoBleak`

可以使用 `bluetooth.async_last_service_info` API 获取设备的最新广告和设备数据，该API将从请求的可连接类型中信号最好的扫描器返回一个 `BluetoothServiceInfoBleak`。

```python
from homeassistant.components import bluetooth

service_info = bluetooth.async_last_service_info(hass, "44:44:33:11:23:42", connectable=True)
```

### Checking if a device is present

To determine if a device is still present, call the `bluetooth.async_address_present` API. This call is helpful if your integration needs the device to be present to consider it available.

```python
from homeassistant.components import bluetooth

bluetooth.async_address_present(hass, "44:44:33:11:23:42", connectable=True)
```

### Fetching all discovered devices

To access the list of previous discoveries, call the `bluetooth.async_discovered_service_info` API. Only devices that are still present will be in the cache.

```python
from homeassistant.components import bluetooth

service_infos = bluetooth.async_discovered_service_info(hass, connectable=True)
```

### Fetching all discovered devices and advertisement data by each Bluetooth adapter

To access the list of previous discoveries and advertisement data received by each adapter independently, call the `bluetooth.async_scanner_devices_by_address` API. The call returns a list of `BluetoothScannerDevice` objects. The same device and advertisement data may appear multiple times, once per Bluetooth adapter that reached it.

```python
from homeassistant.components import bluetooth

device = bluetooth.async_scanner_devices_by_address(hass, "44:44:33:11:23:42", connectable=True)
# device.ble_device is a bleak `BLEDevice`
# device.advertisement is a bleak `AdvertisementData`
# device.scanner is the scanner that found the device
```

### Triggering rediscovery of devices

When a configuration entry or device is removed from Home Assistant, trigger rediscovery of its address to make sure they are available to be set up without restarting Home Assistant. You can make use of the Bluetooth connection property of the device registry if your integration manages multiple devices per configuration entry.

```python

from homeassistant.components import bluetooth

bluetooth.async_rediscover_address(hass, "44:44:33:11:23:42")
```

### Waiting for a specific advertisement

To wait for a specific advertisement, call the `bluetooth.async_process_advertisements` API.

```python
from homeassistant.components import bluetooth

def _process_more_advertisements(
    service_info: BluetoothServiceInfoBleak,
) -> bool:
    """Wait for an advertisement with 323 in the manufacturer_data."""
    return 323 in service_info.manufacturer_data

service_info = await bluetooth.async_process_advertisements(
    hass
    _process_more_advertisements,
    {"address": discovery_info.address, "connectable": False},
    BluetoothScanningMode.ACTIVE,
    ADDITIONAL_DISCOVERY_TIMEOUT
)
```

### Registering an external scanner

Integrations that provide a Bluetooth adapter should add `bluetooth` in [`dependencies`](../../creating_integration_manifest#dependencies) in their [`manifest.json`](../../creating_integration_manifest) and be added to [`after_dependencies`](../../creating_integration_manifest#after-dependencies) to the `bluetooth_adapters` integration.

To register an external scanner, call the `bluetooth.async_register_scanner` API. The scanner must inherit from `BaseHaScanner`.

```python
from homeassistant.components import bluetooth

cancel = bluetooth.async_register_scanner(hass, scanner, connectable=False)
```

The scanner will need to feed advertisement data to the central Bluetooth manager in the form of `BluetoothServiceInfoBleak` objects. The callback needed to send the data to the central manager can be obtained with the `bluetooth.async_get_advertisement_callback` API.

```python
callback = bluetooth.async_get_advertisement_callback(hass)

callback(BluetoothServiceInfoBleak(...))
```
