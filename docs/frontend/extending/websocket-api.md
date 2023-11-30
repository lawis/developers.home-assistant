---
title: "Extending the WebSocket API"
---

作为一个组件，你可能有一些信息想要提供给前端使用。例如，媒体播放器希望将专辑封面提供给前端显示。我们的前端通过 WebSocket API 与后端进行通讯，可以通过自定义命令扩展该 API。

## 注册命令（Python）

要注册一个命令，你需要有一个消息类型、一个消息模式和一个消息处理程序。你的组件不必添加 websocket API 作为依赖项。你注册你的命令，如果用户在使用 websocket API，该命令将可用。

### 定义命令模式

命令模式由消息类型和在调用命令时我们期望的数据类型组成。通过在命令处理程序上使用装饰器来定义命令类型和数据模式。消息处理程序是在事件循环中运行的回调函数。

```python
from homeassistant.components import websocket_api

@websocket_api.websocket_command(
    {
        vol.Required("type"): "frontend/get_panels",
        vol.Optional("preload_panels"): bool,
    }
)
@callback
def ws_get_panels(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle the websocket command."""
    panels = ...
    connection.send_result(msg["id"], {"panels": panels})
```

#### 进行 I/O 操作或发送延迟响应

如果你的命令需要与网络、设备进行交互或需要计算信息，你将需要添加一个作业来执行工作并发送响应。为此，将函数设置为异步函数并使用`@websocket_api.async_response`进行装饰。

```python
from homeassistant.components import websocket_api

@websocket_api.websocket_command(
    {
        vol.Required("type"): "camera/get_thumbnail",
        vol.Optional("entity_id"): str,
    }
)
@websocket_api.async_response
async def ws_handle_thumbnail(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict
) -> None:
    """Handle get media player cover command."""
    # 使用传入的实体 id 检索媒体播放器。
    player = hass.data[DOMAIN].get_entity(msg["entity_id"])

    # 如果播放器不存在，发送错误消息。
    if player is None:
        connection.send_error(
                msg["id"], "entity_not_found", "Entity not found"
            )
        )
        return

    data, content_type = await player.async_get_media_image()

    # 没有媒体播放器缩略图可用
    if data is None:
        connection.send_error(
            msg["id"], "thumbnail_fetch_failed", "Failed to fetch thumbnail"
        )
        return

    connection.send_result(
        msg["id"],
        {
            "content_type": content_type,
            "content": base64.b64encode(data).decode("utf-8"),
        },
    )
```

### 在 WebSocket API 中进行注册

有了所有定义的部分，现在是时候注册命令了。这是在你的 setup 方法中完成的。

```python
async def async_setup(hass, config):
    """Setup of your component."""
    hass.components.websocket_api.async_register_command(ws_get_panels)
    hass.components.websocket_api.async_register_command(ws_handle_thumbnail)
```

## 从前端调用命令（JavaScript）

有了定义的命令，现在是时候从前端调用它了！这是使用 JavaScript 进行的。你需要访问保存 WebSocket 连接到后端的 `hass` 对象。然后只需调用 `hass.connection.sendMessagePromise`。这将返回一个 promise，如果命令成功解析，将被解决，如果命令失败，则返回错误。

```js
hass.connection.sendMessagePromise({
    type: 'media_player/thumbnail',
    entity_id: 'media_player.living_room_tv',
}).then(
    (resp) => {
        console.log('Message success!', resp.result);
    },
    (err) => {
        console.error('Message failed!', err);
    }
);
```

如果你的命令不发送响应，你可以使用 `hass.connection.sendMessage`。
