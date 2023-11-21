---
title: Config Entries 配置条目
---
配置条目是由Home Assistant持久存储的配置数据。配置条目是用户通过UI创建的。UI流程由组件定义的[配置流程处理程序](config_entries_config_flow_handler.md)驱动。配置条目还可以有一个额外的[选项流程处理程序](config_entries_options_flow_handler.md)，也由组件定义。

## 生命周期

| 状态 | 描述 |
| ----- | ----------- |
| 未加载 | 配置条目尚未加载。这是创建配置条目或Home Assistant重启时的初始状态。 |
| 已加载 | 配置条目已加载。 |
| 设置错误 | 设置配置条目时发生错误。 |
| 设置重试 | 配置条目的某个依赖项尚未准备就绪。Home Assistant将自动在未来重新加载此配置条目。重试时间间隔将自动增加。
| 迁移错误 | 配置条目需要迁移到较新版本，但迁移失败。
| 卸载失败 | 尝试卸载配置条目时，要么不支持，要么引发了异常。

<svg class='invertDark' width="508pt" height="188pt" viewBox="0.00 0.00 508.00 188.00" xmlns="http://www.w3.org/2000/svg">
<g id="graph1" class="graph" transform="scale(1 1) rotate(0) translate(4 184)">
<title>G</title>
<polygon fill="none" stroke="none" points="-4,5 -4,-184 505,-184 505,5 -4,5"></polygon>
<g id="node1" class="node"><title>not loaded</title>
<ellipse fill="none" stroke="black" cx="168" cy="-162" rx="51.3007" ry="18"></ellipse>
<text text-anchor="middle" x="168" y="-157.8" font-family="Times,serif" font-size="14.00">not loaded</text>
</g>
<g id="node3" class="node"><title>loaded</title>
<ellipse fill="none" stroke="black" cx="61" cy="-90" rx="36.1722" ry="18"></ellipse>
<text text-anchor="middle" x="61" y="-85.8" font-family="Times,serif" font-size="14.00">loaded</text>
</g>
<g id="edge2" class="edge"><title>not loaded-&gt;loaded</title>
<path fill="none" stroke="black" d="M140.518,-146.666C123.947,-136.676 103.104,-123.187 86.8392,-111.989"></path>
<polygon fill="black" stroke="black" points="88.532,-108.902 78.3309,-106.041 84.5212,-114.639 88.532,-108.902"></polygon>
</g>
<g id="node5" class="node"><title>setup error</title>
<ellipse fill="none" stroke="black" cx="168" cy="-90" rx="52.3895" ry="18"></ellipse>
<text text-anchor="middle" x="168" y="-85.8" font-family="Times,serif" font-size="14.00">setup error</text>
</g>
<g id="edge4" class="edge"><title>not loaded-&gt;setup error</title>
<path fill="none" stroke="black" d="M162.122,-144.055C161.304,-136.346 161.061,-127.027 161.395,-118.364"></path>
<polygon fill="black" stroke="black" points="164.894,-118.491 162.087,-108.275 157.911,-118.012 164.894,-118.491"></polygon>
</g>
<g id="node7" class="node"><title>setup retry</title>
<ellipse fill="none" stroke="black" cx="291" cy="-90" rx="52.0932" ry="18"></ellipse>
<text text-anchor="middle" x="291" y="-85.8" font-family="Times,serif" font-size="14.00">setup retry</text>
</g>
<g id="edge6" class="edge"><title>not loaded-&gt;setup retry</title>
<path fill="none" stroke="black" d="M189.578,-145.465C206.94,-134.869 231.584,-120.783 252.292,-109.59"></path>
<polygon fill="black" stroke="black" points="254.022,-112.634 261.19,-104.832 250.722,-106.461 254.022,-112.634"></polygon>
</g>
<g id="node9" class="node"><title>migration error</title>
<ellipse fill="none" stroke="black" cx="431" cy="-90" rx="69.1427" ry="18"></ellipse>
<text text-anchor="middle" x="431" y="-85.8" font-family="Times,serif" font-size="14.00">migration error</text>
</g>
<g id="edge8" class="edge"><title>not loaded-&gt;migration error</title>
<path fill="none" stroke="black" d="M207.659,-150.445C252.053,-138.628 324.343,-119.388 374.607,-106.01"></path>
<polygon fill="black" stroke="black" points="375.588,-109.37 384.351,-103.416 373.787,-102.606 375.588,-109.37"></polygon>
</g>
<g id="edge10" class="edge"><title>loaded-&gt;not loaded</title>
<path fill="none" stroke="black" d="M85.5216,-103.56C102.143,-113.462 123.939,-127.508 141.027,-139.231"></path>
<polygon fill="black" stroke="black" points="139.274,-142.276 149.481,-145.116 143.273,-136.53 139.274,-142.276"></polygon>
</g>
<g id="node12" class="node"><title>failed unload</title>
<ellipse fill="none" stroke="black" cx="61" cy="-18" rx="61.5781" ry="18"></ellipse>
<text text-anchor="middle" x="61" y="-13.8" font-family="Times,serif" font-size="14.00">failed unload</text>
</g>
<g id="edge12" class="edge"><title>loaded-&gt;failed unload</title>
<path fill="none" stroke="black" d="M61,-71.6966C61,-63.9827 61,-54.7125 61,-46.1124"></path>
<polygon fill="black" stroke="black" points="64.5001,-46.1043 61,-36.1043 57.5001,-46.1044 64.5001,-46.1043"></polygon>
</g>
<g id="edge16" class="edge"><title>setup error-&gt;not loaded</title>
<path fill="none" stroke="black" d="M173.913,-108.275C174.715,-116.03 174.94,-125.362 174.591,-134.005"></path>
<polygon fill="black" stroke="black" points="171.094,-133.832 173.878,-144.055 178.077,-134.327 171.094,-133.832"></polygon>
</g>
<g id="edge14" class="edge"><title>setup retry-&gt;not loaded</title>
<path fill="none" stroke="black" d="M269.469,-106.507C252.104,-117.106 227.436,-131.206 206.71,-142.408"></path>
<polygon fill="black" stroke="black" points="204.973,-139.368 197.805,-147.17 208.273,-145.541 204.973,-139.368"></polygon>
</g>
</g>
</svg>

<!--
Graphviz:
digraph G {
  "not loaded" -> "loaded"
  "not loaded" -> "setup error"
  "not loaded" -> "setup retry"
  "not loaded" -> "migration error"
  "loaded" -> "not loaded"
  "loaded" -> "failed unload"
  "setup retry" -> "not loaded"
  "setup error" -> "not loaded"
}
-->

设置条目

在启动过程中，Home Assistant首先调用[普通组件设置](/creating_component_index.md)，然后为每个条目调用方法`async_setup_entry(hass, entry)`。如果在运行时创建了新的配置条目，Home Assistant也会调用`async_setup_entry(hass, entry)`（示例）。

对于平台

如果组件包括平台，它将需要将配置条目转发给该平台。可以通过在配置条目管理器上调用转发函数来实现这一点 ([example](https://github.com/home-assistant/core/blob/0.68.0/homeassistant/components/hue/bridge.py#L81))：

```python
# Use `hass.async_create_task` to avoid a circular dependency between the platform and the component
hass.async_create_task(
  hass.config_entries.async_forward_entry_setup(
    config_entry, "light"
  )
)
```

要使平台支持配置条目，需要添加一个设置条目的方法。 ([example](https://github.com/home-assistant/core/blob/0.68.0/homeassistant/components/light/hue.py#L60)):

```python
async def async_setup_entry(hass, config_entry, async_add_devices):
    """Set up entry."""
```

卸载条目

组件可以选择支持卸载配置条目。在卸载条目时，组件需要清理所有实体，取消订阅任何事件监听器并关闭所有连接。要实现这一点，请将`async_unload_entry(hass, entry)`添加到您的组件中。([example](https://github.com/home-assistant/core/blob/0.68.0/homeassistant/components/hue/__init__.py#L136)).

对于每个您将配置条目转发到的平台，您还需要转发卸载操作。

```python
await self.hass.config_entries.async_forward_entry_unload(self.config_entry, "light")
```

如果您需要清理平台中实体使用的资源，请让实体实现[`async_will_remove_from_hass`](core/entity.md#async_will_remove_from_hass) 方法。


删除条目

如果组件在删除条目时需要清理代码，可以定义一个删除方法:
```python
async def async_remove_entry(hass, entry) -> None:
    """Handle removal of an entry."""
```

## 将配置条目迁移到新版本

如果配置条目的版本发生变化，必须实现`async_migrate_entry`方法来支持旧条目的迁移。具体的文档细节可以在[config flow documentation](/config_entries_config_flow_handler.md#config-entry-migration)中找到。


```python
async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Migrate old entry."""
```
