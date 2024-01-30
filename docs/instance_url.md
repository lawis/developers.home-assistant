---
title: "Getting the instance URL"
---

在某些情况下，集成需要知道与当前使用场景所需的要求相匹配的用户Home Assistant实例的URL。例如，因为某个设备需要将数据发送回Home Assistant，或者外部服务或设备需要从Home Assistant获取数据（例如生成的图像或音频文件）。

获取实例URL可能相当复杂，因为用户可能有许多不同的URL可用：

- 用户配置的内部家庭网络URL。
- 自动检测到的内部家庭网络URL。
- 用户配置的可以从互联网访问的外部URL。
- 在用户订阅Home Assistant Cloud的情况下，由Nabu Casa提供的URL。

复杂性进一步增加的原因是URL可以使用非标准端口（例如，非80或443）提供，同时可以选择使用或不使用SSL（`http://`与`https://`）。

幸运的是，Home Assistant提供了一个网络助手方法来简化这个过程。

## URL助手

Home Assistant提供了一个网络助手方法，名为`get_url`，用于获取与集成所需的要求匹配的实例URL。

助手方法的签名:

```py
# homeassistant.helpers.network.get_url
def get_url(
    hass: HomeAssistant,
    *,
    require_current_request: bool = False,
    require_ssl: bool = False,
    require_standard_port: bool = False,
    allow_internal: bool = True,
    allow_external: bool = True,
    allow_cloud: bool = True,
    allow_ip: bool = True,
    prefer_external: bool = False,
    prefer_cloud: bool = False,
) -> str:
```
该方法的不同参数有：

- `require_current_request`
  要求返回的 URL 与用户当前在浏览器中使用的 URL 匹配。如果没有当前请求，将出现错误。

- `require_ssl`:
  要求返回的 URL 使用 `https` 方案。

- `require_standard_port`:
  要求返回的 URL 使用标准的 HTTP 端口。因此，它需要 `http` 方案使用端口 80，`https` 方案使用端口 443。

- `allow_internal`:
  允许 URL 为用户设置的内部 URL，或者是内部网络上检测到的 URL。如果需要仅使用外部 URL，则将其设置为 `False`。

- `allow_external`:
  允许 URL 为用户设置的外部 URL，或者 Home Assistant Cloud 的 URL。如果需要仅使用内部 URL，则将其设置为 `False`。

- `allow_cloud`:
  允许返回 Home Assistant Cloud 的 URL，如果需要除 Cloud URL 外的任何 URL，请将其设置为 `False`。

- `allow_ip`:
  允许 URL 的主机部分为 IP 地址，在不可用的情况下将其设置为 `False`。

- `prefer_external`:
  默认情况下，我们倾向于使用内部 URL 而不是外部 URL。将此选项设置为 `True`，则将该逻辑反转，优先使用外部 URL 而不是内部 URL。

- `prefer_cloud`:
  默认情况下，优选用户定义的外部 URL，但在某些情况下，Cloud URL 可能更可靠。将此选项设置为 `True`，则优先使用 Home Assistant Cloud URL 而不是用户定义的外部 URL。

## 默认行为

默认情况下，在不传递其他参数的情况下 (`get_url(hass)`)，它会尝试：

- 获取用户设置的内部 URL，如果不可用，则尝试根据 `http` 设置从网络接口检测到一个。

- 如果内部 URL 失败，则尝试获取一个外部 URL。它优先使用用户设置的外部 URL，如果失败，则获取一个 Home Assistant Cloud URL。

默认设置是：允许任何 URL，但首选本地 URL，没有要求。

## 示例用法

使用 helper 的最基本示例：

```py
from homeassistant.helpers.network import get_url

instance_url = get_url(hass)
```

这个辅助方法的示例调用将返回一个首选的内部 URL，它可以是用户设置的或者是检测到的。如果无法提供这样的 URL，将尝试使用用户设置的外部 URL。最后，如果用户没有设置外部 URL，将会尝试使用 Home Assistant Cloud 的 URL。

如果绝对找不到可用的 URL（或者没有满足要求的 URL），将会引发一个异常：`NoURLAvailableError`。

```py
from homeassistant.helpers import network

try:
    external_url = network.get_url(
        hass,
        allow_internal=False,
        allow_ip=False,
        require_ssl=True,
        require_standard_port=True,
    )
except network.NoURLAvailableError:
    raise MyInvalidValueError("Failed to find suitable URL for my integration")
```

上面的例子展示了 URL 辅助方法的一种稍微复杂的用法。在这种情况下，请求的 URL 可能不是一个内部地址，URL 可能不包含 IP 地址，要求使用 SSL，并且必须在标准端口上提供服务。

如果没有可用的 URL，可以捕捉和处理 `NoURLAvailableError` 异常。