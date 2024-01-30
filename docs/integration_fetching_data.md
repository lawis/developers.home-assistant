---
title: "Fetching Data 获取数据"
---

您的集成将需要从API获取数据，以便将其提供给Home Assistant。这个API可以通过网络（本地或云）、套接字、通过USB设备暴露的串行端口等方式访问。

## 推送与轮询

API以许多不同的形式存在，但在其核心，它们可分为两类：推送和轮询。

使用推送方式，我们订阅一个API，在API通知我们有新数据可用时会通知我们。API会将改变推送给我们。推送API非常好，因为它们消耗更少的资源。当发生变化时，我们可以得到通知，并且不必重新获取所有数据并找到变化。由于实体可以被禁用，您应确保您的实体在`async_added_to_hass`回调内订阅，并在移除时取消订阅。

使用轮询，我们将在指定的时间间隔内从API获取最新数据。然后，您的集成将向其实体提供这些数据，这些数据将写入Home Assistant。

因为轮询是如此常见，Home Assistant默认假设您的实体基于轮询。如果情况不是这样，请从`Entity.should_poll`属性返回`False`。当您禁用轮询时，您的集成将负责调用以下方法之一来指示Home Assistant是时候将实体状态写入Home Assistant了：

- 如果您是在异步函数中执行，并且不需要调用实体更新方法，请调用`Entity.async_write_ha_state()`。这是一个异步回调，将状态写入在让事件循环中调度之前的状态机。
- `Entity.schedule_update_ha_state(force_refresh=False)`/`Entity.async_schedule_update_ha_state(force_refresh=False)`将调度更新实体。如果`force_refresh`设置为`True`，Home Assistant将在写入状态之前调用您的实体更新方法（`update()`/`async_update()）。

## 轮询API端点

下面我们将解释一些不同的API类型以及在Home Assistant中集成它们的最佳方法。请注意，某些集成将涉及下面列出的不同类型的组合。

### 为所有实体协调的单个API轮询数据

该API将有一个用于为在Home Assistant中拥有的所有实体获取数据的单个方法。在这种情况下，我们将希望定期对这个端点进行单一的轮询，然后让实体在新数据对它们可用时立即知晓。

Home Assistant提供了一个名为DataUpdateCoordinator的类，以帮助您尽可能高效地管理这个过程。


```python
"""Example integration using DataUpdateCoordinator."""

from datetime import timedelta
import logging

import async_timeout

from homeassistant.components.light import LightEntity
from homeassistant.core import callback
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry, async_add_entities):
    """Config entry example."""
    # assuming API object stored here by __init__.py
    my_api = hass.data[DOMAIN][entry.entry_id]
    coordinator = MyCoordinator(hass, my_api)

    # Fetch initial data so we have data when entities subscribe
    #
    # If the refresh fails, async_config_entry_first_refresh will
    # raise ConfigEntryNotReady and setup will try again later
    #
    # If you do not want to retry setup on failure, use
    # coordinator.async_refresh() instead
    #
    await coordinator.async_config_entry_first_refresh()

    async_add_entities(
        MyEntity(coordinator, idx) for idx, ent in enumerate(coordinator.data)
    )


class MyCoordinator(DataUpdateCoordinator):
    """My custom coordinator."""

    def __init__(self, hass, my_api):
        """Initialize my coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            # Name of the data. For logging purposes.
            name="My sensor",
            # Polling interval. Will only be polled if there are subscribers.
            update_interval=timedelta(seconds=30),
        )
        self.my_api = my_api

    async def _async_update_data(self):
        """Fetch data from API endpoint.

        This is the place to pre-process the data to lookup tables
        so entities can quickly look up their data.
        """
        try:
            # Note: asyncio.TimeoutError and aiohttp.ClientError are already
            # handled by the data update coordinator.
            async with async_timeout.timeout(10):
                # Grab active context variables to limit data required to be fetched from API
                # Note: using context is not required if there is no need or ability to limit
                # data retrieved from API.
                listening_idx = set(self.async_contexts())
                return await self.my_api.fetch_data(listening_idx)
        except ApiAuthError as err:
            # Raising ConfigEntryAuthFailed will cancel future updates
            # and start a config flow with SOURCE_REAUTH (async_step_reauth)
            raise ConfigEntryAuthFailed from err
        except ApiError as err:
            raise UpdateFailed(f"Error communicating with API: {err}")


class MyEntity(CoordinatorEntity, LightEntity):
    """An entity using CoordinatorEntity.

    The CoordinatorEntity class provides:
      should_poll
      async_update
      async_added_to_hass
      available

    """

    def __init__(self, coordinator, idx):
        """Pass coordinator to CoordinatorEntity."""
        super().__init__(coordinator, context=idx)
        self.idx = idx

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._attr_is_on = self.coordinator.data[self.idx]["state"]
        self.async_write_ha_state()

    async def async_turn_on(self, **kwargs):
        """Turn the light on.

        Example method how to request data updates.
        """
        # Do the turning on.
        # ...

        # Update the data
        await self.coordinator.async_request_refresh()
```

### 单独为每个实体进行轮询

某些 API 可能针对每个设备提供一个端点。有时将 API 设备映射到单个实体可能并不容易。如果您从单个 API 设备端点创建多个实体，请参阅前面的部分。

如果您可以将一个设备端点精确地映射到单个实体，您可以在 `update()`/`async_update()` 方法中为该实体获取数据。确保将轮询设置为 `True`，Home Assistant 将定期调用此方法。

如果您的实体在首次写入 Home Assistant 之前需要获取数据，请在添加实体时传递 `update_before_add=True` 给 `add_entities` 方法：`add_entities([MyEntity()], update_before_add=True)`。

您可以通过在平台中定义 `SCAN_INTERVAL` 常量来控制集成的轮询间隔。但要小心不要将其设置得太低。这将占用 Home Assistant 中的资源，可能会压倒托管 API 的设备，或导致您被云 API 阻止访问。最小允许值为 5 秒。

```python
from datetime import timedelta

SCAN_INTERVAL = timedelta(seconds=5)
```

## 推送 API 端点

如果您有一个推送数据的 API 端点，您仍然可以使用数据更新协调器。只需在构造函数中不传递轮询参数 `update_method` 和 `update_interval`。

当有新数据到达时，使用 `coordinator.async_set_updated_data(data)` 将数据传递给实体。如果在轮询协调器上使用此方法，它将重置下次轮询数据之前的时间。

## 请求并行性

:::info
这是一个高级主题。
:::

Home Assistant 内置了逻辑，以确保集成不会过度使用 API 并消耗 Home Assistant 中的所有可用资源。该逻辑围绕限制并行请求的数量。此逻辑在服务调用和实体更新期间会自动使用。

Home Assistant 通过为每个集成维护一个 [semaphore](https://docs.python.org/3/library/asyncio-sync.html#asyncio.Semaphore) 来控制并行更新的数量。例如，如果信号量允许 1 个并行连接，则更新和服务调用将在进行中时等待。如果值为 0，集成本身负责根据需要限制并行请求的数量。

平台的默认并行请求值是根据首次添加到 Home Assistant 的实体确定的。如果实体定义了 `async_update` 方法，则值为 0，否则为 1。（这是一个遗留决定）

平台可以通过在其平台中定义 `PARALLEL_UPDATES` 常量来覆盖默认值（例如 `rflink/light.py`）。