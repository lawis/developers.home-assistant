---
title: "应用程序证书"
---

集成可能支持[通过 OAuth2 进行配置](/docs/config_entries_config_flow_handler#configuration-via-oauth2)，允许用户链接他们的帐户。集成可以添加一个 `application_credentials.py` 文件，并实现下面描述的函数。

OAuth2 需要在应用程序和供应商之间共享的凭证。在 Home Assistant 中，特定于集成的 OAuth2 凭证可以使用一种或多种方法提供：

- *使用应用凭证组件进行本地 OAuth*: 用户使用云提供商创建自己的凭证，通常充当应用程序开发人员，并将凭证注册到 Home Assistant 和集成中。此方法是支持 OAuth2 的所有集成*必需的*。
- *使用云组件进行云帐户链接*: Nabu Casa 在云提供商注册凭证，提供无缝的用户体验。此方法提供无缝的用户体验，*建议使用*（[更多信息](/docs/config_entries_config_flow_handler#configuration-via-oauth2)）。

## 添加支持

集成可以通过在 `manifest.json` 中添加对 `application_credentials` 组件的依赖来支持应用凭证：
```json
{
  ...
  "dependencies": ["application_credentials"],
  ...
}
```


然后在集成文件夹中添加一个名为 `application_credentials.py` 的文件，并实现以下内容：
```python
from homeassistant.core import HomeAssistant
from homeassistant.components.application_credentials import AuthorizationServer


async def async_get_authorization_server(hass: HomeAssistant) -> AuthorizationServer:
    """Return authorization server."""
    return AuthorizationServer(
        authorize_url="https://example.com/auth",
        token_url="https://example.com/oauth2/v4/token"
    )
```
### AuthorizationServer

`AuthorizationServer` 表示用于集成的 [OAuth2 认证服务器](https://datatracker.ietf.org/doc/html/rfc6749)。

| 名称          | 类型 |                                                                                                    | 描述 |
| ------------- | ---- | -------------------------------------------------------------------------------------------------- | ----------- |
| `authorize_url` | str  | **必需** | 在配置流程期间用户被重定向到的 OAuth 授权 URL。 |
| `token_url`     | str  | **必需** | 用于获取访问令牌的 URL。                                           |

### 自定义 OAuth2 实现

Integrations may alternatively provide a custom `AbstractOAuth2Implementation` in `application_credentials.py` like the following:

```python
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_entry_oauth2_flow
from homeassistant.components.application_credentials import AuthImplementation, AuthorizationServer, ClientCredential


class OAuth2Impl(AuthImplementation):
    """Custom OAuth2 implementation."""
    # ... Override AbstractOAuth2Implementation details

async def async_get_auth_implementation(
    hass: HomeAssistant, auth_domain: str, credential: ClientCredential
) -> config_entry_oauth2_flow.AbstractOAuth2Implementation:
    """Return auth implementation for a custom auth implementation."""
    return OAuth2Impl(
        hass,
        auth_domain,
        credential,
        AuthorizationServer(
            authorize_url="https://example.com/auth",
            token_url="https://example.com/oauth2/v4/token"
        )
    )
```

## 导入 YAML 凭证

曾经使用 YAML 凭证的集成可以使用由应用凭证集成提供的 import API `async_import_client_credential` 导入凭证。

以下是曾经使用 YAML 凭证的集成的示例：

```python
from homeassistant.components.application_credentials import (
    ClientCredential,
    async_import_client_credential,
)

# Example configuration.yaml schema for an integration
CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_CLIENT_ID): cv.string,
                vol.Required(CONF_CLIENT_SECRET): cv.string,
            }
        )
    },
)

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the component."""
    if DOMAIN not in config:
        return True

    await async_import_client_credential(
        hass,
        DOMAIN,
        ClientCredential(
            config[DOMAIN][CONF_CLIENT_ID],
            config[DOMAIN][CONF_CLIENT_SECRET],
        ),
    )
```
新的集成不应该在 `configuration.yaml` 中接受凭证，因为用户可以在 Application Credentials 用户界面中输入凭证。

### ClientCredential

`ClientCredential` 表示用户提供的客户端凭证。

| 名称            | 类型 |                                                                                       | 描述         |
| --------------- | ---- | ------------------------------------------------------------------------------------- | ----------- |
| client_id       | str  | **必需** | 用户提供的 OAuth 客户端 ID。     |
| client_secret   | str  | **必需** | 用户提供的 OAuth 客户端密钥。 |

## 翻译

Application Credentials 的翻译定义在组件翻译文件 `strings.json` 的 `application_credentials` 键下。以下是一个示例：

```json
{
    "application_credentials": {
        "description": "Navigate to the [developer console]({console_url}) to create credentials then enter them below.",
    }
}
```

You may optionally add description placeholder keys that are added to the message by adding a new method in `application_credentials.py` like the following:

```python
from homeassistant.core import HomeAssistant

async def async_get_description_placeholders(hass: HomeAssistant) -> dict[str, str]:
    """Return description placeholders for the credentials dialog."""
    return {
        "console_url": "https://example.com/developer/console",
    }
```

While developing locally, you will need to run `python3 -m script.translations develop` to see changes made to `strings.json` [More info on translating Home Assistant.](translations.md)