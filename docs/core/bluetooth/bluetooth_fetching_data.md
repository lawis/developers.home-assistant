---
title: "Fetching Bluetooth Data 获取蓝牙数据"
---

## Choosing a method to fetch data 选择获取数据的方法

如果设备通知更新的主要方法是蓝牙广告，并且其主要功能是传感器、二进制传感器或触发事件：

- 如果所有传感器都通过蓝牙广告进行更新：[`PassiveBluetoothProcessorCoordinator`](#passivebluetoothprocessorcoordinator)
- 如果某些传感器需要主动连接：[`ActiveBluetoothProcessorCoordinator`](#activebluetoothprocessorcoordinator)

如果设备通知更新的主要方法是蓝牙广告，并且其主要功能**不是**传感器、二进制传感器或触发事件：

- 如果所有实体都通过蓝牙广告进行更新：[`PassiveBluetoothCoordinator`](#passivebluetoothcoordinator)
- 如果需要主动连接：[`ActiveBluetoothCoordinator`](#activebluetoothcoordinator)

如果您的设备只通过主动蓝牙连接进行通信，而不使用蓝牙广告：

- [`DataUpdateCoordinator`](/docs/integration_fetching_data)

## BluetoothProcessorCoordinator

`ActiveBluetoothProcessorCoordinator`和`PassiveBluetoothProcessorCoordinator`极大地减少了创建主要作为传感器、二进制传感器或触发事件的集成所需的代码。通过将输入到处理器协调器的数据格式化为`PassiveBluetoothDataUpdate`对象，框架可以负责根据需要创建实体，并允许最小化的`sensor`和`binary_sensor`平台实现。

这些框架要求从库中获取的数据按照下面示例的形式格式化为`PassiveBluetoothDataUpdate`：


```python
@dataclasses.dataclass(frozen=True)
class PassiveBluetoothEntityKey:
    """Key for a passive bluetooth entity.

    Example:
    key: temperature
    device_id: outdoor_sensor_1
    """

    key: str
    device_id: str | None

@dataclasses.dataclass(frozen=True)
class PassiveBluetoothDataUpdate(Generic[_T]):
    """Generic bluetooth data."""

    devices: dict[str | None, DeviceInfo] = dataclasses.field(default_factory=dict)
    entity_descriptions: Mapping[
        PassiveBluetoothEntityKey, EntityDescription
    ] = dataclasses.field(default_factory=dict)
    entity_names: Mapping[PassiveBluetoothEntityKey, str | None] = dataclasses.field(
        default_factory=dict
    )
    entity_data: Mapping[PassiveBluetoothEntityKey, _T] = dataclasses.field(
        default_factory=dict
    )
```

### PassiveBluetoothProcessorCoordinator

Example `async_setup_entry` for an integration `__init__.py` using a `PassiveBluetoothProcessorCoordinator`:

```python
import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.bluetooth import BluetoothScanningMode
from homeassistant.components.bluetooth.passive_update_processor import (
    PassiveBluetoothProcessorCoordinator,
)
from .const import DOMAIN
from homeassistant.const import Platform

PLATFORMS: list[Platform] = [Platform.SENSOR]

from your_library import DataParser

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up example BLE device from a config entry."""
    address = entry.unique_id
    data = DataParser()
    coordinator = hass.data.setdefault(DOMAIN, {})[
        entry.entry_id
    ] = PassiveBluetoothProcessorCoordinator(
        hass,
        _LOGGER,
        address=address,
        mode=BluetoothScanningMode.ACTIVE,
        update_method=data.update,
    )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(
        # only start after all platforms have had a chance to subscribe
        coordinator.async_start()
    )
    return True
```

Example `sensor.py`:

```python
from homeassistant import config_entries
from homeassistant.components.bluetooth.passive_update_processor import (
    PassiveBluetoothDataProcessor,
    PassiveBluetoothDataUpdate,
    PassiveBluetoothEntityKey,
    PassiveBluetoothProcessorCoordinator,
    PassiveBluetoothProcessorEntity,
)
from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN


def sensor_update_to_bluetooth_data_update(parsed_data):
    """Convert a sensor update to a Bluetooth data update."""
    # This function must convert the parsed_data
    # from your library's update_method to a `PassiveBluetoothDataUpdate`
    # See the structure above
    return PassiveBluetoothDataUpdate(
        devices={},
        entity_descriptions={},
        entity_data={},
        entity_names={},
    )


async def async_setup_entry(
    hass: HomeAssistant,
    entry: config_entries.ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the example BLE sensors."""
    coordinator: PassiveBluetoothProcessorCoordinator = hass.data[DOMAIN][
        entry.entry_id
    ]
    processor = PassiveBluetoothDataProcessor(sensor_update_to_bluetooth_data_update)
    entry.async_on_unload(
        processor.async_add_entities_listener(
            ExampleBluetoothSensorEntity, async_add_entities
        )
    )
    entry.async_on_unload(coordinator.async_register_processor(processor))


class ExampleBluetoothSensorEntity(PassiveBluetoothProcessorEntity, SensorEntity):
    """Representation of an example BLE sensor."""

    @property
    def native_value(self) -> float | int | str | None:
        """Return the native value."""
        return self.processor.entity_data.get(self.entity_key)

```

### ActiveBluetoothProcessorCoordinator

An `ActiveBluetoothProcessorCoordinator` functions nearly the same as a `PassiveBluetoothProcessorCoordinator`
but will also make an active connection to poll for data based on `needs_poll_method` and a `poll_method`
function which are called when the device's Bluetooth advertisement changes. The `sensor.py` implementation
is the same as the `PassiveBluetoothProcessorCoordinator`.

Example `async_setup_entry` for an integration `__init__.py` using an `ActiveBluetoothProcessorCoordinator`:

```python
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.components.bluetooth import BluetoothScanningMode

from homeassistant.components.bluetooth import (
    BluetoothScanningMode,
    BluetoothServiceInfoBleak,
    async_ble_device_from_address,
)
from homeassistant.const import Platform

from homeassistant.components.bluetooth.active_update_processor import (
    ActiveBluetoothProcessorCoordinator,
)
PLATFORMS: list[Platform] = [Platform.SENSOR]

from your_library import DataParser

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up example BLE device from a config entry."""
    address = entry.unique_id
    assert address is not None
    data = DataParser()

    def _needs_poll(
        service_info: BluetoothServiceInfoBleak, last_poll: float | None
    ) -> bool:
        return (
            hass.state == CoreState.running
            and data.poll_needed(service_info, last_poll)
            and bool(
                async_ble_device_from_address(
                    hass, service_info.device.address, connectable=True
                )
            )
        )

    async def _async_poll(service_info: BluetoothServiceInfoBleak):
        if service_info.connectable:
            connectable_device = service_info.device
        elif device := async_ble_device_from_address(
            hass, service_info.device.address, True
        ):
            connectable_device = device
        else:
            # We have no Bluetooth controller that is in range of
            # the device to poll it
            raise RuntimeError(
                f"No connectable device found for {service_info.device.address}"
            )
        return await data.async_poll(connectable_device)

    coordinator = hass.data.setdefault(DOMAIN, {})[
        entry.entry_id
    ] = ActiveBluetoothProcessorCoordinator(
        hass,
        _LOGGER,
        address=address,
        mode=BluetoothScanningMode.PASSIVE,
        update_method=data.update,
        needs_poll_method=_needs_poll,
        poll_method=_async_poll,
        # We will take advertisements from non-connectable devices
        # since we will trade the BLEDevice for a connectable one
        # if we need to poll it
        connectable=False,
    )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(
        # only start after all platforms have had a chance to subscribe
        coordinator.async_start()
    )
    return True
```

## BluetoothCoordinator

The `ActiveBluetoothCoordinator` and `PassiveBluetoothCoordinator` coordinators function similar
to `DataUpdateCoordinators` except they are driven by incoming advertisement data instead of polling.

### PassiveBluetoothCoordinator

Below is an example of a `PassiveBluetoothDataUpdateCoordinator`. Incoming
data is received via `_async_handle_bluetooth_event` and processed by the integration's
library.

```python
import logging
from typing import TYPE_CHECKING

from homeassistant.components import bluetooth
from homeassistant.components.bluetooth.active_update_coordinator import (
    PassiveBluetoothDataUpdateCoordinator,
)
from homeassistant.core import CoreState, HomeAssistant, callback

if TYPE_CHECKING:
    from bleak.backends.device import BLEDevice


class ExamplePassiveBluetoothDataUpdateCoordinator(
    PassiveBluetoothDataUpdateCoordinator[None]
):
    """Class to manage fetching example data."""

    def __init__(
        self,
        hass: HomeAssistant,
        logger: logging.Logger,
        ble_device: BLEDevice,
        device: YourLibDevice,
    ) -> None:
        """Initialize example data coordinator."""
        super().__init__(
            hass=hass,
            logger=logger,
            address=ble_device.address,
            mode=bluetooth.BluetoothScanningMode.ACTIVE,
            connectable=False,
        )
        self.device = device

    @callback
    def _async_handle_unavailable(
        self, service_info: bluetooth.BluetoothServiceInfoBleak
    ) -> None:
        """Handle the device going unavailable."""

    @callback
    def _async_handle_bluetooth_event(
        self,
        service_info: bluetooth.BluetoothServiceInfoBleak,
        change: bluetooth.BluetoothChange,
    ) -> None:
        """Handle a Bluetooth event."""
        # Your device should process incoming advertisement data

```

### ActiveBluetoothCoordinator

Below is an example of an `ActiveBluetoothDataUpdateCoordinator`. Incoming data is received via `_async_handle_bluetooth_event` and processed by the integration's library.

The method passed to `needs_poll_method` is called each time the Bluetooth advertisement changes to determine if the method passed to `poll_method` should be called to make an active connection to the device to obtain additional data.

```python
import logging
from typing import TYPE_CHECKING

from homeassistant.components import bluetooth
from homeassistant.components.bluetooth.active_update_coordinator import (
    ActiveBluetoothDataUpdateCoordinator,
)
from homeassistant.core import CoreState, HomeAssistant, callback

if TYPE_CHECKING:
    from bleak.backends.device import BLEDevice


class ExampleActiveBluetoothDataUpdateCoordinator(
    ActiveBluetoothDataUpdateCoordinator[None]
):
    """Class to manage fetching example data."""

    def __init__(
        self,
        hass: HomeAssistant,
        logger: logging.Logger,
        ble_device: BLEDevice,
        device: YourLibDevice,
    ) -> None:
        """Initialize example data coordinator."""
        super().__init__(
            hass=hass,
            logger=logger,
            address=ble_device.address,
            needs_poll_method=self._needs_poll,
            poll_method=self._async_update,
            mode=bluetooth.BluetoothScanningMode.ACTIVE,
            connectable=True,
        )
        self.device = device

    @callback
    def _needs_poll(
        self,
        service_info: bluetooth.BluetoothServiceInfoBleak,
        seconds_since_last_poll: float | None,
    ) -> bool:
        # Only poll if hass is running, we need to poll,
        # and we actually have a way to connect to the device
        return (
            self.hass.state == CoreState.running
            and self.device.poll_needed(seconds_since_last_poll)
            and bool(
                bluetooth.async_ble_device_from_address(
                    self.hass, service_info.device.address, connectable=True
                )
            )
        )

    async def _async_update(
        self, service_info: bluetooth.BluetoothServiceInfoBleak
    ) -> None:
        """Poll the device."""

    @callback
    def _async_handle_unavailable(
        self, service_info: bluetooth.BluetoothServiceInfoBleak
    ) -> None:
        """Handle the device going unavailable."""

    @callback
    def _async_handle_bluetooth_event(
        self,
        service_info: bluetooth.BluetoothServiceInfoBleak,
        change: bluetooth.BluetoothChange,
    ) -> None:
        """Handle a Bluetooth event."""
        # Your device should process incoming advertisement data

```
