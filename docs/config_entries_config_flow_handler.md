---
title: "Config Flow(配置流程)"
---

通过在配置流程中增加配置条目,就可以在用户界面中设置集成. 想要通过配置条目来设置组件,就必须定义配置流程回调子程序(Config Flow Handler). 回调子程序(handler)可以管理条目的创建,这些条目可以来自用户输入,自动发现,或者其他来源(比如 Home Assistant OS).

配置流程回调子程序操控着存储在配置条目中的数据. 这样的好处在于Home Assistant启动时,不需要验证配置是否正确. 这也可以防止因为版本变化而导致的破坏性变化,因为我们可以在版本变化时,将配置条目处理为新版本支持的格式.

## Updating the manifest(设置清单文件)

你需要在集成的清单文件(manifest.json)文件中设置,以便Home Assistant知道您的集成有配置流程. 在清单文件中添加`config_flow: true`即可.具体请参考([清单文件](creating_integration_manifest.md#config-flow)).

## Defining your config flow(定义配置流程)

配置条目使用[数据流条目框架(data flow entry framework)](data_entry_flow_index.md)来定义其配置流. 配置流需要在集成文件夹的`config_flow.py`文件中定义,扩展`homeassistant.config_entries.ConfigFlow`,并传递`domain`键作为继承`ConfigFlow`的一部分.

```python
from homeassistant import config_entries
from .const import DOMAIN


class ExampleConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Example config flow."""
    # The schema version of the entries that it creates
    # Home Assistant will call your migrate method if the version changes
    VERSION = 1
```

一旦你更新了清单文件（manifest）并创建了 `config_flow.py`，你需要运行`python3 -m script.hassfest`（只需运行一次）来激活Home Assistant中你的集成的配置条目。

## Defining steps(定义步骤)

你的配置流程需要定义配置流程的步骤。每个步骤由唯一的步骤名称（`step_id`）标识。步骤回调方法遵循`async_step_<step_id>`的模式。(data_entry_flow_index.md) 文档描述了步骤的不同返回值。下面是定义user步骤的示例代码:

```python
import voluptuous as vol

class ExampleConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    async def async_step_user(self, info):
        if info is not None:
            pass  # TODO: process info

        return self.async_show_form(
            step_id="user", data_schema=vol.Schema({vol.Required("password"): str})
        )
```

有一些步骤名称被保留供系统使用:

| Step name (步骤名称)  | Description (描述)                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bluetooth`        | 如果您的集成已通过蓝牙发现 [using `bluetooth` in the manifest](creating_integration_manifest.md#bluetooth).             |
| `discovery` | _DEPRECATED_已弃用 Invoked if your integration has been discovered and the matching step has not been defined.（如果您的集成已被发现，但未定义匹配的步骤，则此功能已被弃用。）             |
| `dhcp`      | 如果您的集成已通过DHCP（动态主机配置协议）发现，就会调用这个功能。DHCP是一种网络协议，用于为设备分配IP地址和其他网络配置信息。通过DHCP发现意味着您的集成能够在网络中自动获取IP地址和配置信息，并被发现 [using `dhcp` in the manifest](creating_integration_manifest.md#dhcp).             |
| `hassio`    | 如果您的集成已通过Supervisor add-on发现
| `homekit`   | 如果您的集成已通过HomeKit发现 [using `homekit` in the manifest](creating_integration_manifest.md#homekit).         |
| `mqtt`      | 如果您的集成已通过MQTT发现 [using `mqtt` in the manifest](creating_integration_manifest.md#mqtt).             |
| `ssdp`      | 如果您的集成已通过SSDP/uPnP发现 [using `ssdp` in the manifest](creating_integration_manifest.md#ssdp).             |
| `usb`       | 如果您的集成已通过USB发现 [using `usb` in the manifest](creating_integration_manifest.md#usb).             |
| `user`      | 当用户通过用户界面启动流程，或者发现了匹配的步骤和发现步骤都未定义时.                                                                                                  |
| `zeroconf`  | 如果您的集成已通过Zeroconf/mDNS发现 [using `zeroconf` in the manifest](creating_integration_manifest.md#zeroconf). |

## Unique IDs （唯一id）

在配置流程中，可以为配置流程附加一个唯一ID，以避免同一设备被设置两次。当设置了唯一ID时，如果另一个具有相同唯一ID的流程正在进行中，它将立即中止。您还可以在已经存在该ID的配置条目时快速中止。配置条目将获得创建它们的流程的唯一ID。

Call inside a config flow step（在配置流程步骤中调用）:

```python
await self.async_set_unique_id(device_unique_id)
self._abort_if_unique_id_configured()
```

如果配置流程中断，将在用户界面中以中止原因的形式显示来自  `strings.json` 中 `abort` 部分的键为 `already_configured` 的文本资源。

```json
{
  "config": {
    "abort": {
      "already_configured": "Device is already configured"
    }
  }
}
```
通过设置唯一ID，用户将有选项忽略对配置条目的发现。这样，他们将不会再受到相关干扰。
如果集成使用蓝牙、DHCP、HomeKit、Zeroconf/mDNS、USB或SSDP/uPnP来进行发现，则必须提供唯一ID。

如果没有可用的唯一ID，可以选择省略 `bluetooth`、`dhcp`、`zeroconf`、`hassio`、`homekit`、`ssdp`、`usb` 和 `discovery` 步骤，即使它们在集成清单中配置了。
在这种情况下，当发现配置项时，将调用 `user` 步骤。

另外，如果集成无法始终获得唯一ID（例如，多个设备，一些有唯一ID，一些没有），可以使用辅助工具进行发现，只要尚未配置集成的实例即可。

```python
if device_unique_id:
  await self.async_set_unique_id(device_unique_id)
await self._async_handle_discovery_without_unique_id()
```

### Unique ID Requirements

唯一ID用于将配置条目与底层设备或API进行匹配。唯一ID必须是稳定的，并且用户不应该能够更改它。唯一ID可以用于在设备访问详细信息更改时更新配置条目数据。例如，对于通过本地网络通信的设备，如果IP地址由于新的DHCP分配而更改，集成可以使用唯一ID来更新主机，代码示例如下：
```
    await self.async_set_unique_id(serial_number)
    self._abort_if_unique_id_configured(updates={CONF_HOST: host, CONF_PORT: port})
```

#### 唯一ID可以被接受的来源示例

- 设备序列号
- MAC地址: 使用 `homeassistant.helpers.device_registry.format_mac`格式化; 只可以通过设备API或者通过发现回调程序(discovery handler)获取MAC地址.依赖于读取ARP缓存,或者访问本地网络(例如 `getmac`)的工具,无法在支持的网络环境中正常工作,因此将不被接受.
- 经纬度或者其他有唯一性的地理位置.
- 直接打印在设备上或者烧录在EEPROM中的唯一ID. 

#### 本地设备唯一ID的可接受来源

- 主机名 : 如果主机名的子集包含可接受的源,则可以使用这一部分.

#### 云服务的唯一ID的可接受来源

- 邮件地址: 必须格式合法,且为小写.
- 用户名: 必须格式合法,如果不区分大小写,则必须为小写.
- 账户ID: 必须不可重复.

#### 不被接受的唯一ID

- IP地址
- 设备名称
- 用户可以修改的主机名
- URL

### Unignoring(重新发现忽略的条目)

您的配置流程可以通过在配置流程中实现unignore步骤来重新发现先前被忽略的条目.

```python
async def async_step_unignore(self, user_input):
    unique_id = user_input["unique_id"]
    await self.async_set_unique_id(unique_id)

    # TODO: Discover devices and find the one that matches the unique ID.

    return self.async_show_form(…)
```

### 发现步骤
当一个集成被发现时，相应的发现步骤会被调用（例如 `async_step_dhcp` 或 `async_step_zeroconf`），并提供发现的信息。这些步骤需要检查以下几点：
- 确保没有其他此配置流程的实例正在设置所发现的设备。如果有多种方法可以发现设备在网络上，就可能会出现这种情况。
- 确保设备尚未设置。
- 调用发现步骤不应导致完成流程和配置条目。始终需要与用户确认。

### 无需身份验证的可发现集成
如果集成可以在无需任何身份验证的情况下进行发现，您可以使用内置的可发现流程。此流程提供以下功能：
- 在结束配置流程之前检测设备/服务是否可以在网络上被发现。
- 支持所有基于清单的发现协议。
- 限制为仅1个配置条目。由配置条目负责发现所有可用设备。

### OAuth2 配置
Home Assistant内置支持使用 OAuth2 授权框架进行帐户链接的集成。要利用此功能，您需要以允许Home Assistant负责刷新令牌的方式构建Python API库。有关如何执行此操作的详细信息，请参阅我们的 API库指南。

### 翻译
配置流程处理程序的翻译定义在组件翻译文件 `strings.json` 中的 `config` 键下。

如果您需要更详细的指南或有其他问题，请随时告诉我。



```json
{
  "title": "Philips Hue Bridge",
  "config": {
    "step": {
      "init": {
        "title": "Pick Hue bridge",
        "data": {
          "host": "Host"
        }
      },
      "link": {
        "title": "Link Hub",
        "description": "Press the button on the bridge to register Philips Hue with Home Assistant.\n\n![Location of button on bridge](/static/images/config_philips_hue.jpg)"
      }
    },
    "error": {
      "register_failed": "Failed to register, please try again",
      "linking": "Unknown linking error occurred."
    },
    "abort": {
      "discover_timeout": "Unable to discover Hue bridges",
      "no_bridges": "No Philips Hue bridges discovered",
      "all_configured": "All Philips Hue bridges are already configured",
      "unknown": "Unknown error occurred",
      "cannot_connect": "Unable to connect to the bridge",
      "already_configured": "Bridge is already configured"
    }
  }
}
```

When the translations are merged into Home Assistant, they will be automatically uploaded to [Lokalise](https://lokalise.co/) where the translation team will help to translate them in other languages. While developing locally, you will need to run `python3 -m script.translations develop` to see changes made to `strings.json` [More info on translating Home Assistant.](translations.md)

## Config Entry Migration

正如上面提到的，每个配置条目都有一个分配给它的版本号。这是为了在配置条目架构发生更改时能够迁移配置条目数据到新的格式。

迁移可以通过在组件的__init__.py文件中实现async_migrate_entry函数来进行程序处理。该函数应返回True，表示迁移成功

```python
# Example migration function
async def async_migrate_entry(hass, config_entry: ConfigEntry):
    """Migrate old entry."""
    _LOGGER.debug("Migrating from version %s", config_entry.version)

    if config_entry.version == 1:

        new = {**config_entry.data}
        # TODO: modify Config Entry data

        config_entry.version = 2
        hass.config_entries.async_update_entry(config_entry, data=new)

    _LOGGER.info("Migration to version %s successful", config_entry.version)

    return True
```

If only the config entry version is changed, but no other properties, `async_update_entry` should not be called:
```python
# Example migration function which does not modify config entry properties, e.g. data or options
async def async_migrate_entry(hass, config_entry: ConfigEntry):
    """Migrate old entry."""
    _LOGGER.debug("Migrating from version %s", config_entry.version)

    if config_entry.version == 1:

        # TODO: Do some changes which is not stored in the config entry itself

        # There's no need to call async_update_entry, the config entry will automatically be
        # saved when async_migrate_entry returns True
        config_entry.version = 2

    _LOGGER.info("Migration to version %s successful", config_entry.version)

    return True
```

## Reauthentication

优雅地处理诸如无效、过期或被撤销的令牌等身份验证错误对于在[Integration Quality Scale](integration_quality_scale_index.md)上取得进展是必要的。这个例子展示了如何按照[Building a Python library](api_lib_auth.md#oauth2)中的模式，将重新授权添加到`script.scaffold`创建的OAuth流程中。

这个例子在`__init__.py`中的配置条目设置中捕获身份验证异常，并指示用户访问集成页面以重新配置集成。

```python

from homeassistant.config_entries import SOURCE_REAUTH, ConfigEntry
from homeassistant.core import HomeAssistant
from . import api

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Setup up a config entry."""

    # TODO: Replace with actual API setup and exception
    auth = api.AsyncConfigEntryAuth(...)
    try:
        await auth.refresh_tokens()
    except TokenExpiredError as err:
        raise ConfigEntryAuthFailed(err) from err

    # TODO: Proceed with component setup
```

`config_flow.py`中的流程处理程序还需要一些额外的步骤来支持重新授权，包括显示确认信息、启动重新授权流程、更新现有的配置条目，并重新加载以再次调用设置。

```python

class OAuth2FlowHandler(
    config_entry_oauth2_flow.AbstractOAuth2FlowHandler, domain=DOMAIN
):
    """Config flow to handle OAuth2 authentication."""

    reauth_entry: ConfigEntry | None = None

    async def async_step_reauth(self, user_input=None):
        """Perform reauth upon an API authentication error."""
        self.reauth_entry = self.hass.config_entries.async_get_entry(
            self.context["entry_id"]
        )
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input=None):
        """Dialog that informs the user that reauth is required."""
        if user_input is None:
            return self.async_show_form(
                step_id="reauth_confirm",
                data_schema=vol.Schema({}),
            )
        return await self.async_step_user()

    async def async_oauth_create_entry(self, data: dict) -> dict:
        """Create an oauth config entry or update existing entry for reauth."""
        if self._reauth_entry:
            self.hass.config_entries.async_update_entry(self.reauth_entry, data=data)
            await self.hass.config_entries.async_reload(self.reauth_entry.entry_id)
            return self.async_abort(reason="reauth_successful")
        return await super().async_oauth_create_entry(data)
```

根据集成的具体细节，可能还需要其他考虑因素，比如确保在重新授权过程中使用同一个账户，或处理多个配置条目。

重新授权确认对话框需要在`strings.json`中添加额外的定义，包括重新授权确认和成功对话框的内容。

```json
{
  "config": {
    "step": {
      "reauth_confirm": {
        "title": "[%key:common::config_flow::title::reauth%]",
        # TODO: Replace with the name of the integration
        "description": "The Example integration needs to re-authenticate your account"
      }
    },
    "abort": {
      "reauth_successful": "[%key:common::config_flow::abort::reauth_successful%]"
    },
}
```

您可以参考[Translations](#translations)中的本地开发说明。

身份验证失败（比如被撤销的 OAuth 令牌）可能会有点棘手，手动测试起来比较困难。其中一个建议是复制`config/.storage/core.config_entries`，并手动更改`access_token`、`refresh_token`和`expires_at`的值，根据您想要测试的情景。然后，您可以逐步进行重新授权流程，并确认这些值是否被新的有效令牌替换。

自动化测试应该验证重新授权流程是否更新了现有的配置条目，并且没有创建额外的条目。

## Testing your config flow

与配置流程相关的集成需要对`config_flow.py`中的所有代码进行全面测试覆盖才能被接受到核心部分。[Test your code](development_testing.md#running-a-limited-test-suite) 中包含有关如何生成覆盖率报告的更多细节。