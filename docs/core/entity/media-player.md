---
title: Media Player Entity
sidebar_label: Media Player
---

媒体播放器实体控制一个媒体播放器。从[`homeassistant.components.media_player.MediaPlayerEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/media_player/__init__.py)派生一个平台实体。

## 属性

:::tip
属性应该只从内存中返回信息，而不进行 I/O 操作（如网络请求）。实现`update()`或`async_update()`来获取数据。
:::

| 名称 | 类型 | 默认值 | 描述
| ---- | ---- | ------- | -----------
| supported_features | int | int | 支持的功能标志。
| sound_mode | string | None | 媒体播放器的当前声音模式。
| sound_mode_list | list | None | 可用声音模式的动态列表（由平台设置，为空表示不支持声音模式）。
| source | string | None | 媒体播放器当前选择的输入源。
| source_list | list | None | 媒体播放器的可能输入源列表（该列表应包含适合前端显示的可读名称）
| media_image_url | string | None | 表示当前图像的 URL。
| media_image_remotely_accessible | boolean | False | 如果属性`media_image_url`可以在家庭网络外访问，则返回`True`。
| device_class | string | `None` | 媒体播放器的类型。
| group_members | list | `None` | 一组当前正在进行同步播放的播放器实体的动态列表。如果平台有定义组长的概念，则组长应该是该列表的第一个元素。

## 支持的功能

支持的功能使用`MediaPlayerEntityFeature`枚举值定义，并使用按位或（`|`）运算符组合。

| 值                 | 描述                                                     |
| ------------------- | ------------------------------------------------------------------ |
| `BROWSE_MEDIA`      | 实体允许浏览媒体。                                      |
| `CLEAR_PLAYLIST`    | 实体允许清除活动播放列表。                        |
| `GROUPING`          | 实体可以与其他播放器一起分组进行同步播放。 |
| `MEDIA_ANNOUNCE`    | 实体支持`play_media`服务的announce参数。     |
| `MEDIA_ENQUEUE`     | 实体支持`play_media`服务的enqueue参数。      |
| `NEXT_TRACK`        | 实体允许跳到下一个媒体轨道。                    |
| `PAUSE`             | 实体允许暂停媒体的播放。                      |
| `PLAY`              | 实体允许播放/继续播放媒体。                  |
| `PLAY_MEDIA`        | 实体允许播放媒体源。                               |
| `PREVIOUS_TRACK`    | 实体允许返回到先前的媒体轨道。            |
| `REPEAT_SET`        | 实体允许设置重复播放。                          |
| `SEEK`              | 实体允许在媒体播放过程中调整位置。           |
| `SELECT_SOUND_MODE` | 实体允许选择声音模式。                              |
| `SELECT_SOURCE`     | 实体允许选择源/输入。                            |
| `SHUFFLE_SET`       | 实体允许对活动播放列表进行洗牌。                 |
| `STOP`              | 实体允许停止媒体的播放。                      |
| `TURN_OFF`          | 实体可以被关闭。                                   |
| `TURN_ON`           | 实体可以被打开。                                   |
| `VOLUME_MUTE`       | 实体音量可以被静音。                            |
| `VOLUME_SET`        | 实体音量可以被设定到特定的级别。           |
| `VOLUME_STEP`       | 实体音量可以向上和向下调整。                 |

## 状态

媒体播放器的状态使用`MediaPlayerState`枚举值定义，并可以具有以下可能的值。

| 值       | 描述                                                                                                         |
|-------------|---------------------------------------------------------------------------------------------------------------------|
| `OFF`       | 实体已关闭，并且在打开之前不接受命令。                                                 |
| `ON`        | 实体已打开，但当前不知道其状态的详细信息。                                               |
| `IDLE`      | 实体已打开并接受命令，但当前未播放任何媒体。可能在某个空闲的主页屏幕上。 |
| `PLAYING`   | 实体当前正在播放媒体。                                                                                  |
| `PAUSED`    | 实体有一个活动媒体并且当前处于暂停状态                                                                |
| `STANDBY`   | 实体处于低功耗状态，接受命令。                              |
| `BUFFERING` | 实体正在准备开始播放某个媒体                                                                                   |

## Methods

### Play Media

Tells the media player to play media. Implement it using the following:

```python
class MyMediaPlayer(MediaPlayerEntity):

    def play_media(
        self,
        media_type: str,
        media_id: str,
        enqueue: MediaPlayerEnqueue | None = None,
        announce: bool | None = None, **kwargs: Any
    ) -> None:
        """Play a piece of media."""

    async def async_play_media(
        self,
        media_type: str,
        media_id: str,
        enqueue: MediaPlayerEnqueue | None = None,
        announce: bool | None = None, **kwargs: Any
    ) -> None:
        """Play a piece of media."""

```

`enqueue`属性是一个字符串枚举`MediaPlayerEnqueue`：

- `add`：将给定的媒体项添加到队列的末尾。
- `next`：播放给定的媒体项，保留队列。
- `play`：立即播放给定的媒体项，保留队列。
- `replace`：立即播放给定的媒体项，清除队列。

当`announce`布尔属性设置为`true`时，媒体播放器应尝试暂停当前的音乐，向用户宣布媒体，然后恢复音乐播放。

### 浏览媒体

如果媒体播放器支持浏览媒体，应该实现以下方法：



```python
class MyMediaPlayer(MediaPlayerEntity):

    async def async_browse_media(
        self, media_content_type: str | None = None, media_content_id: str | None = None
    ) -> BrowseMedia:
        """Implement the websocket media browsing helper."""
        return await media_source.async_browse_media(
            self.hass,
            media_content_id,
            content_filter=lambda item: item.media_content_type.startswith("audio/"),
        )
```

If the media player also allows playing media from URLs, you can also add support for browsing
Home Assistant media sources. These sources can be provided by any integration. Examples provide
text-to-speech and local media.

```python
from homeassistant.components import media_source
from homeassistant.components.media_player.browse_media import (
    async_process_play_media_url,
)

class MyMediaPlayer(MediaPlayerEntity):

    async def async_browse_media(
        self, media_content_type: str | None = None, media_content_id: str | None = None
    ) -> BrowseMedia:
        """Implement the websocket media browsing helper."""
        # If your media player has no own media sources to browse, route all browse commands
        # to the media source integration.
        return await media_source.async_browse_media(
            self.hass,
            media_content_id,
            # This allows filtering content. In this case it will only show audio sources.
            content_filter=lambda item: item.media_content_type.startswith("audio/"),
        )

    async def async_play_media(
        self,
        media_type: str,
        media_id: str,
        enqueue: MediaPlayerEnqueue | None = None,
        announce: bool | None = None, **kwargs: Any
    ) -> None:
        """Play a piece of media."""
        if media_source.is_media_source_id(media_id):
            media_type = MediaType.MUSIC
            play_item = await media_source.async_resolve_media(self.hass, media_id, self.entity_id)
            # play_item returns a relative URL if it has to be resolved on the Home Assistant host
            # This call will turn it into a full URL
            media_id = async_process_play_media_url(self.hass, play_item.url)

        # Replace this with calling your media player play media function.
        await self._media_player.play_url(media_id)
```

### Select sound mode

Optional. Switch the sound mode of the media player.

```python
class MyMediaPlayer(MediaPlayerEntity):
    # Implement one of these methods.

    def select_sound_mode(self, sound_mode):
        """Switch the sound mode of the entity."""

    def async_select_sound_mode(self, sound_mode):
        """Switch the sound mode of the entity."""
```

### Select source

Optional. Switch the selected input source for the media player.

```python
class MyMediaPlayer(MediaPlayerEntity):
    # Implement one of these methods.

    def select_source(self, source):
        """Select input source."""

    def async_select_source(self, source):
        """Select input source."""
```

### Mediatype

Required. Returns one of the values from the MediaType enum that matches the mediatype

| CONST |
|-------|
|MediaType.MUSIC|
|MediaType.TVSHOW|
|MediaType.MOVIE|
|MediaType.VIDEO|
|MediaType.EPISODE|
|MediaType.CHANNEL|
|MediaType.PLAYLIST|
|MediaType.IMAGE|
|MediaType.URL|
|MediaType.GAME|
|MediaType.APP|

```python
class MyMediaPlayer(MediaPlayerEntity):
    # Implement the following method.

    @property
    def media_content_type(self):
    """Content type of current playing media."""
```

:::info
Using the integration name as the `media_content_type` is also acceptable within the `play_media` service if the integration provides handling which does not map to the defined constants.
:::

### Available device classes

Optional. What type of media device is this. It will possibly map to google device types.

| Value | Description
| ----- | -----------
| tv | Device is a television type device.
| speaker | Device is speakers or stereo type device.
| receiver | Device is audio video receiver type device taking audio and outputting to speakers and video to some display.

### Proxy album art for media browser

Optional. If your media player is only accessible from the internal network, it will need to proxy the album art via Home Assistant to be able to work while away from home or through a mobile app.

To proxy an image via Home Assistant, set the `thumbnail` property of a `BrowseMedia` item to a url generated by the `self.get_browse_image_url(media_content_type, media_content_id, media_image_id=None)` method. The browser will then fetch this url, which will result in a call to `async_get_browse_image(media_content_type, media_content_id, media_image_id=None)`.

:::info
Only use a proxy for the thumbnail if the web request originated from outside the network. You can test this with `is_local_request(hass)` imported from `homeassistant.helpers.network`.
:::

In `async_get_browse_image`, use `self._async_fetch_image(url)` to fetch the image from the local network. Do not use `self._async_fetch_image_from_cache(url)` which should only be used to for the currently playing artwork.

:::info
Do not pass an url as `media_image_id`. This can allow an attacker to fetch any data from the local network.
:::

```python
class MyMediaPlayer(MediaPlayerEntity):

    # Implement the following method.
    async def async_get_browse_image(self, media_content_type, media_content_id, media_image_id=None):
    """Serve album art. Returns (content, content_type)."""
    image_url = ...
    return await self._async_fetch_image(image_url)
```

### Grouping player entities together

Optional. If your player has support for grouping player entities together for synchronous playback (indicated by `SUPPORT_GROUPING`) one join and one unjoin method needs to be defined.

```python
class MyMediaPlayer(MediaPlayerEntity):
    # Implement one of these join methods:

    def join_players(self, group_members):
        """Join `group_members` as a player group with the current player."""

    async def async_join_players(self, group_members):
        """Join `group_members` as a player group with the current player."""

    # Implement one of these unjoin methods:

    def unjoin_player(self):
        """Remove this player from any group."""

    async def async_unjoin_player(self):
        """Remove this player from any group."""
```
