---
title: "Handling Setup Failures 处理设置失败"
---

您的集成可能由于各种原因无法设置。最常见的情况是设备或服务离线，或者凭据不再有效。您的集成必须重试设置，以便在设备或服务恢复在线时能尽快恢复，而无需用户重新启动 Home Assistant。

## 处理离线或不可用的设备和服务

### 使用 `async_setup_entry` 的集成

在集成的 `__init__.py` 中的 `async_setup_entry` 中引发 `ConfigEntryNotReady` 异常，Home Assistant 将自动负责稍后重试设置。为了避免疑虑，在平台的 `async_setup_entry` 中引发 `ConfigEntryNotReady` 是无效的，因为这时已经太迟无法被配置条目设置捕获。

#### Example

```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Setup the config entry for my device."""
    device = MyDevice(entry.data[CONF_HOST])
    try:
        await device.async_setup()
    except (asyncio.TimeoutError, TimeoutException) as ex:
        raise ConfigEntryNotReady(f"Timeout while connecting to {device.ipaddr}") from ex
```

如果您正在使用[DataUpdateCoordinator](integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities)，调用`await coordinator.async_config_entry_first_refresh()`也会在首次刷新失败时自动触发此异常。

如果您的集成支持发现，一旦您的设备或服务被发现，Home Assistant 将自动重试设置。

#### 处理重试的日志记录

将错误消息作为第一个参数传递给`ConfigEntryNotReady`。Home Assistant 将以`警告`级别记录一次重试，后续重试将以`调试`级别记录。错误消息还将传播到用户界面，并显示在集成页面上。如果在引发`ConfigEntryNotReady`时没有设置消息，则Home Assistant 将尝试从引发`ConfigEntryNotReady`的异常中提取原因，前提是该异常是从另一个异常传播过来的。

集成不应记录任何关于重试的非调试消息，而应依靠内置在`ConfigEntryNotReady`中的逻辑来避免垃圾邮件式记录。

### 使用`async_setup_platform`的集成

在`async_setup_platform`中引发`PlatformNotReady`异常，Home Assistant 将自动负责稍后重试设置。

#### 示例

```python
async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the platform."""
    device = MyDevice(conf[CONF_HOST])
    try:
        await device.async_setup()
    except ConnectionError as ex:
        raise PlatformNotReady(f"Connection error while connecting to {device.ipaddr}: {ex}") from ex
```

#### 处理重试的日志记录

将错误消息作为`PlatformNotReady`的第一个参数传递。Home Assistant 将以`警告`级别记录一次重试，后续重试将以`调试`级别记录。如果在引发`ConfigEntryNotReady`时没有设置消息，则Home Assistant 将尝试从引发`ConfigEntryNotReady`的异常中提取原因，前提是该异常是从另一个异常传播过来的。

集成不应记录任何关于重试的非调试消息，而应依靠内置在`PlatformNotReady`中的逻辑来避免垃圾邮件式记录。

## 处理凭证过期的情况

引发`ConfigEntryAuthFailed`异常，Home Assistant 将自动将配置条目置于失败状态并启动重新认证流程。必须在`__init__.py`中的`async_setup_entry`或`DataUpdateCoordinator`中引发异常，否则异常将无法有效触发重新认证流程。如果您的集成不使用`DataUpdateCoordinator`，调用`entry.async_start_reauth()`可以用作启动重新认证流程的替代方法。

`reauth`流程将使用以下上下文变量启动，并在`async_step_reauth`步骤中可用：

- source：始终为“SOURCE_REAUTH”
- entry_id：需要重新进行身份验证的配置条目的entry_id
- unique_id：需要重新进行身份验证的配置条目的唯一标识


#### Example

```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Setup the config entry for my device."""
    device = MyDevice(entry.data[CONF_HOST])
    try:
        await device.async_setup()
    except AuthFailed as ex:
        raise ConfigEntryAuthFailed(f"Credentials expired for {device.name}") from ex
    except (asyncio.TimeoutError, TimeoutException) as ex:
        raise ConfigEntryNotReady(f"Timed out while connecting to {device.ipaddr}") from ex
```
