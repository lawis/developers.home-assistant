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

Once you have updated your manifest and created the `config_flow.py`, you will need to run `python3 -m script.hassfest` (one time only) for Home Assistant to activate the config entry for your integration.

## Defining steps(定义步骤)

Your config flow will need to define steps of your configuration flow. Each step is identified by a unique step name (`step_id`). The step callback methods follow the pattern `async_step_<step_id>`. The docs for [Data Entry Flow](data_entry_flow_index.md) describe the different return values of a step. Here is an example of how to define the `user` step:

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

There are a few step names reserved for system use:

| Step name   | Description                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bluetooth`        | Invoked if your integration has been discovered via Bluetooth as specified [using `bluetooth` in the manifest](creating_integration_manifest.md#bluetooth).             |
| `discovery` | _DEPRECATED_ Invoked if your integration has been discovered and the matching step has not been defined.             |
| `dhcp`      | Invoked if your integration has been discovered via DHCP as specified [using `dhcp` in the manifest](creating_integration_manifest.md#dhcp).             |
| `hassio`    | Invoked if your integration has been discovered via a Supervisor add-on.
| `homekit`   | Invoked if your integration has been discovered via HomeKit as specified [using `homekit` in the manifest](creating_integration_manifest.md#homekit).         |
| `mqtt`      | Invoked if your integration has been discovered via MQTT as specified [using `mqtt` in the manifest](creating_integration_manifest.md#mqtt).             |
| `ssdp`      | Invoked if your integration has been discovered via SSDP/uPnP as specified [using `ssdp` in the manifest](creating_integration_manifest.md#ssdp).             |
| `usb`       | Invoked if your integration has been discovered via USB as specified [using `usb` in the manifest](creating_integration_manifest.md#usb).             |
| `user`      | Invoked when a user initiates a flow via the user interface or when discovered and the matching and discovery step are not defined.                                                                                                  |
| `zeroconf`  | Invoked if your integration has been discovered via Zeroconf/mDNS as specified [using `zeroconf` in the manifest](creating_integration_manifest.md#zeroconf). |

## Unique IDs

A config flow can attach a unique ID to a config flow to avoid the same device being set up twice. When a unique ID is set, it will immediately abort if another flow is in progress for this unique ID. You can also quickly abort if there is already an existing config entry for this ID. Config entries will get the unique ID of the flow that creates them.

Call inside a config flow step:

```python
await self.async_set_unique_id(device_unique_id)
self._abort_if_unique_id_configured()
```

Should the config flow then abort, the text resource with the key `already_configured` from the `abort` part of your `strings.json` will be displayed to the user in the interface as an abort reason.

```json
{
  "config": {
    "abort": {
      "already_configured": "Device is already configured"
    }
  }
}
```

By setting a unique ID, users will have the option to ignore the discovery of your config entry. That way, they won't be bothered about it anymore.
If the integration uses Bluetooth, DHCP, HomeKit, Zeroconf/mDNS, USB, or SSDP/uPnP to be discovered, supplying a unique ID is required.

If a unique ID isn't available, alternatively, the `bluetooth`, `dhcp`, `zeroconf`, `hassio`, `homekit`, `ssdp`, `usb`, and `discovery` steps can be omitted, even if they are configured in
the integration manifest. In that case, the `user` step will be called when the item is discovered.

Alternatively, if an integration can't get a unique ID all the time (e.g., multiple devices, some have one, some don't), a helper is available
that still allows for discovery, as long as there aren't any instances of the integrations configured yet.

```python
if device_unique_id:
  await self.async_set_unique_id(device_unique_id)
await self._async_handle_discovery_without_unique_id()
```

### Unique ID Requirements

A Unique ID is used to match a config entry to the underlying device or API. The Unique ID must be stable and should not be able to be changed by the user. The Unique ID can be used to update the config entry data when device access details change. For example, for devices that communicate over the local network, if the IP address changes due to a new DHCP assignment, the integration can use the Unique ID to update the host using the following code snippet:

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

```python
async def async_step_unignore(self, user_input):
    unique_id = user_input["unique_id"]
    await self.async_set_unique_id(unique_id)

    # TODO: Discover devices and find the one that matches the unique ID.

    return self.async_show_form(…)
```

## Discovery steps

When an integration is discovered, their respective discovery step is invoked (ie `async_step_dhcp` or `async_step_zeroconf`) with the discovery information. The step will have to check the following things:

- Make sure there are no other instances of this config flow in progress of setting up the discovered device. This can happen if there are multiple ways of discovering that a device is on the network.
- Make sure that the device is not already set up.
- Invoking a discovery step should never result in a finished flow and a config entry. Always confirm with the user.

## Discoverable integrations that require no authentication

If your integration is discoverable without requiring any authentication, you'll be able to use the Discoverable Flow that is built-in. This flow offers the following features:

- Detect if devices/services can be discovered on the network before finishing the config flow.
- Support all manifest-based discovery protocols.
- Limit to only 1 config entry. It is up to the config entry to discover all available devices.

To get started, run `python3 -m script.scaffold config_flow_discovery` and follow the instructions. This will create all the boilerplate necessary to configure your integration using discovery.

## Configuration via OAuth2

Home Assistant has built-in support for integrations that offer account linking using [the OAuth2 authorization framework](https://www.rfc-editor.org/rfc/rfc6749). To be able to leverage this, you will need to structure your Python API library in a way that allows Home Assistant to be responsible for refreshing tokens. See our [API library guide](api_lib_index.md) on how to do this.

The built-in OAuth2 support works out of the box with locally configured client ID / secret using the [Application Credentials platform](/docs/core/platform/application_credentials) and with the Home Assistant Cloud Account Linking service. This service allows users to link their account with a centrally managed client ID/secret. If you want your integration to be part of this service, reach out to us at [hello@home-assistant.io](mailto:hello@home-assistant.io).

To get started, run `python3 -m script.scaffold config_flow_oauth2` and follow the instructions. This will create all the boilerplate necessary to configure your integration using OAuth2.

## Translations

Translations for the config flow handlers are defined under the `config` key in the component translation file `strings.json`. Example of the Hue component:

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

As mentioned above - each Config Entry has a version assigned to it. This is to be able to migrate Config Entry data to new formats when Config Entry schema changes.

Migration can be handled programatically by implementing function `async_migrate_entry` in your component's `__init__.py` file. The function should return `True` if migration is successful.

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

Gracefully handling authentication errors such as invalid, expired, or revoked tokens is needed to advance on the [Integration Qualily Scale](integration_quality_scale_index.md). This example of how to add reauth to the OAuth flow created by `script.scaffold` following the pattern in [Building a Python library](api_lib_auth.md#oauth2).

This example catches an authentication exception in config entry setup in `__init__.py` and instructs the user to visit the integrations page in order to reconfigure the integration.

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

The flow handler in `config_flow.py` also needs to have some additional steps to support reauth which include showing a confirmation, starting the reauth flow, updating the existing config entry, and reloading to invoke setup again.

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

Depending on the details of the integration, there may be additional considerations such as ensuring the same account is used across reauth, or handling multiple config entries.

The reauth confirmation dialog needs additional definitions in `strings.json` for the reauth confirmation and success dialogs:

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

See [Translations](#translations) local development instructions.

Authentication failures (such as a revoked oauth token) can be a little tricky to manually test. One suggestion is to make a copy of `config/.storage/core.config_entries` and manually change the values of `access_token`, `refresh_token`, and `expires_at` depending on the scenario you want to test. You can then walk advance through the reauth flow and confirm that the values get replaced with new valid tokens.

Automated tests should verify that the reauth flow updates the existing config entry and does not create additional entries.

## Testing your config flow

Integrations with a config flow require full test coverage of all code in `config_flow.py` to be accepted into core. [Test your code](development_testing.md#running-a-limited-test-suite) includes more details on how to generate a coverage report.
