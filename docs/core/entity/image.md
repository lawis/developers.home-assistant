---
title: Image Entity
sidebar_label: Image
---

图片实体可以显示静态图片。从 [`homeassistant.components.image.ImageEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/image/__init__.py) 派生实体平台。

图片实体是 [`camera`](/docs/core/entity/camera) 实体的简化版本，支持提供静态图片或可获取的图片 URL。

实现可以提供一个 URL，从该 URL 自动获取图片，或者提供图片数据作为 `bytes`。当提供 URL 时，获取的图片将被缓存在 `self._cached_image` 中，将 `self._cached_image` 设置为 `None` 以使缓存失效。

## 属性

:::tip
属性应仅从内存中返回信息，不应执行 I/O 操作（如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

| 名称                     | 类型           | 默认值         | 描述                                                                                                        |
| ------------------------ | ------------  | ------------  | ------------------------------------------------------------------------------------------------------------- |
| content_type             | str           | `image/jpeg`  | 图片的内容类型，如果实体提供了 URL，则会自动设置。                                                            |
| image_last_updated       | datetime      | `None`        | 图片最后更新的时间戳。用于确定 `state`。前端在此更改时会重新获取图片。                                           |
| image_url                | str 或 None   | `UNDEFINED`   | 可选的图片 URL，从该 URL 获取图片。                                                                            |

## 方法

### 图片

如果实体返回图片的字节而不是提供 URL，则应实现 `async_image` 或 `image` 方法。

注意：
- 图片实体的 `async_image` 或 `image` 方法仅在前端获取图片时调用。
- 前端仅在图片实体的状态更改时重新获取图片。

这意味着在 `async def async_image` 中增加 `image_last_updated` 属性是不正确的。应该在状态更新的一部分中完成它，以表示有可用的更新图片。

```python
class MyImage(ImageEntity):
    # Implement one of these methods.

    def image(self) -> bytes | None:
        """Return bytes of image."""

    async def async_image(self) -> bytes | None:
        """Return bytes of image."""
```
