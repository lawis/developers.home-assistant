---
title: Light Entity
sidebar_label: Light
---

暗光实体控制光源的亮度、色调和饱和度颜色值、白色值、色温和效果。从 [`homeassistant.components.light.LightEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/light/__init__.py) 派生实体平台。

## 属性

| 名称                     | 类型           | 默认值         | 描述                                                                                                                         |
| ------------------------ | ------------  | ------------  | --------------------------------------------------------------------------------------------------------------------------- |
| brightness               | int           | `None`        | 返回光源的亮度，取值范围为 1..255。                                                                                           |
| color_mode               | string        | `None`        | 返回光源的颜色模式。返回的颜色模式必须存在于 `supported_color_modes` 属性中。                                                 |
| color_temp_kelvin        | int           | `None`        | 返回以 Kelvin 为单位的色温颜色值。当光源的颜色模式设置为 `ColorMode.COLOR_TEMP` 时，此属性将被复制到光源的状态属性中；否则将被忽略。          |
| effect                   | string        | `None`        | 返回当前的效果。                                                                                                              |
| effect_list              | list          | `None`        | 返回支持的效果列表。                                                                                                          |
| hs_color                 | tuple         | `None`        | 返回色调和饱和度颜色值（float，float）。当光源的颜色模式设置为 `ColorMode.HS` 时，此属性将被复制到光源的状态属性中；否则将被忽略。        |
| is_on                    | bool          | `None`        | 返回光源实体是否打开。                                                                                                        |
| max_color_temp_kelvin    | int           | `int`         | 返回光源支持的最低色温（以 Kelvin 为单位）。                                                                                    |
| min_color_temp_kelvin    | int           | `int`         | 返回光源支持的最高色温（以 Kelvin 为单位）。                                                                                    |
| rgb_color                | tuple         | `None`        | 返回 RGB 颜色值（int，int，int）。当光源的颜色模式设置为 `ColorMode.RGB` 时，此属性将被复制到光源的状态属性中；否则将被忽略。           |
| rgbw_color               | tuple         | `None`        | 返回 RGBW 颜色值（int，int，int，int）。当光源的颜色模式设置为 `ColorMode.RGBW` 时，此属性将被复制到光源的状态属性中；否则将被忽略。     |
| rgbww_color              | tuple         | `None`        | 返回 RGBWW 颜色值（int，int，int，int，int）。当光源的颜色模式设置为 `ColorMode.RGBWW` 时，此属性将被复制到光源的状态属性中；否则将被忽略。 |
| supported_color_modes    | set           | `None`        | 标记支持的颜色模式的集合。                                                                                                    |
| supported_features       | int           | `int`         | 标记支持的功能的标志位。                                                                                                      |
| white_value              | int           | `None`        | 返回光源的白色值，取值范围为 0..255。该属性已弃用，并将在 Home Assistant 2021.10 中移除。                                         |
| xy_color                 | tuple         | `None`        | 返回 XY 颜色值（float，float）。当光源的颜色模式设置为 `ColorMode.XY` 时，此属性将被复制到光源的状态属性中；否则将被忽略。           |

## 颜色模式

新的集成必须实现 `color_mode` 和 `supported_color_modes`。如果要升级现有的集成以支持颜色模式，则应实现 `color_mode` 和 `supported_color_modes`。

支持的颜色模式通过在 `ColorMode` 枚举中使用值来定义。

如果一个光源没有实现 `supported_color_modes`，则根据 `supported_features` 属性中的已弃用标志来推断。具体步骤如下：

- 从一个空集合开始。
- 如果设置了 `SUPPORT_COLOR_TEMP`，则添加 `ColorMode.COLOR_TEMP`。
- 如果设置了 `SUPPORT_COLOR`，则添加 `ColorMode.HS`。
- 如果设置了 `SUPPORT_WHITE_VALUE`，则添加 `ColorMode.RGBW`。
- 如果设置了 `SUPPORT_BRIGHTNESS`，并且尚未添加任何颜色模式，则添加 `ColorMode.BRIGHTNESS`。
- 如果尚未添加任何颜色模式，则添加 `ColorMode.ONOFF`。

如果一个光源没有实现 `color_mode`，则根据设置了哪些属性以及哪些属性为 `None` 来推断。具体步骤如下：

- 如果 `supported_color_mode` 包括 `ColorMode.RGBW`，并且 `white_value` 和 `hs_color` 都不为 `None`，则返回 `ColorMode.RGBW`。
- 否则，如果 `supported_color_mode` 包括 `ColorMode.HS`，并且 `hs_color` 不为 `None`，则返回 `ColorMode.HS`。
- 否则，如果 `supported_color_mode` 包括 `ColorMode.COLOR_TEMP`，并且 `color_temp` 不为 `None`，则返回 `ColorMode.COLOR_TEMP`。
- 否则，如果 `supported_color_mode` 包括 `ColorMode.BRIGHTNESS`，并且 `brightness` 不为 `None`，则返回 `ColorMode.BRIGHTNESS`。
- 否则，如果 `supported_color_mode` 包括 `ColorMode.ONOFF`，则返回 `ColorMode.ONOFF`。
- 否则，返回 `ColorMode.UNKNOWN`。

| Value | Description |
| ------ | ------------ |
| `ColorMode.UNKNOWN` | 灯光的颜色模式未知。 |
| `ColorMode.ONOFF` | 灯光可以打开或关闭。如果灯光支持，此模式必须是唯一支持的模式。 |
| `ColorMode.BRIGHTNESS` | 灯光可以调暗。如果灯光支持，此模式必须是唯一支持的模式。 |
| `ColorMode.COLOR_TEMP` | 灯光可以调暗，并且其颜色温度在状态中存在。 |
| `ColorMode.HS` | 灯光可以调暗，并且可以调整颜色。可以使用 `brightness` 参数设置灯光的亮度，并通过 `brightness` 属性进行读取。可以使用 `hs_color` 参数设置灯光的颜色，并通过 `hs_color` 属性进行读取。`hs_color` 是一个 (h, s) 元组（不包含亮度）。 |
| `ColorMode.RGB` | 灯光可以调暗，并且可以调整颜色。可以使用 `brightness` 参数设置灯光的亮度，并通过 `brightness` 属性进行读取。可以使用 `rgb_color` 参数设置灯光的颜色，并通过 `rgb_color` 属性进行读取。`rgb_color` 是一个 (r, g, b) 元组（不考虑亮度）。 |
| `ColorMode.RGBW` | 灯光可以调暗，并且可以调整颜色。可以使用 `brightness` 参数设置灯光的亮度，并通过 `brightness` 属性进行读取。可以使用 `rgbw_color` 参数设置灯光的颜色，并通过 `rgbw_color` 属性进行读取。`rgbw_color` 是一个 (r, g, b, w) 元组（不考虑亮度）。 |
| `ColorMode.RGBWW` | 灯光可以调暗，并且可以调整颜色。可以使用 `brightness` 参数设置

## Methods

### Turn on Light Device

```python
class MyLightEntity(LightEntity):
    def turn_on(self, **kwargs):
        """Turn the device on."""

    async def async_turn_on(self, **kwargs):
        """Turn device on."""
```

请注意，在 `async_turn_on` 方法中没有传递 `color_mode` 参数，而只允许使用单一的颜色属性。
可以确保集成系统在调用 `turn_on` 时只接收到单一的颜色属性，并且该属性根据灯光的 `supported_color_modes` 属性来确定是否被支持。为了确保这一点，如果灯光不支持相应的颜色模式，服务调用中的颜色将在调用实体的 `async_turn_on` 方法之前进行转换:

| 颜色类型   | 转换
|--------------|-----------------------
| color_temp | 如果不受支持，则将其从服务调用中删除，并将其转换为 `hs_color`、`rgb_color`、`rgbw_color`、`rgbww_color` 或 `xy_color`（如果灯光支持）。
| hs_color | 如果不受支持，则将其从服务调用中删除，并将其转换为 `rgb_color`、`rgbw_color`、`rgbww_color` 或 `xy_color`（如果灯光支持）。
| rgb_color | 如果不受支持，则将其从服务调用中删除，并将其转换为 `rgbw_color`、`rgbww_color`、`hs_color` 或 `xy_color`（如果灯光支持）。
| rgbw_color | 如果不受支持，则将其从服务调用中删除。
| rgbww_color | 如果不受支持，则将其从服务调用中删除。
| xy_color | 如果不受支持，则将其从服务调用中删除，并将其转换为 `hs_color`、`rgb_color`、`rgbw_color` 或 `rgbww_color`（如果灯光支持）。


### Turn Off Light Device

```python
class MyLightEntity(LightEntity):
    def turn_off(self, **kwargs):
        """Turn the device off."""

    async def async_turn_off(self, **kwargs):
        """Turn device off."""
```
