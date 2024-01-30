---
title: Options Flow（选择流程）
---

通过配置条目进行配置的集成可以向用户公开选项，以允许用户调整集成的行为，例如集成哪些设备或位置。

配置条目选项使用 [Data Flow Entry 框架](data_entry_flow_index.md) 来允许用户更新配置条目的选项。支持配置条目选项的组件需要定义一个选项流处理程序（Options Flow Handler）。

## Options support


要支持选项，集成需要在其配置流处理程序中拥有一个`async_get_options_flow`方法。调用该方法将返回组件选项流处理程序的实例。

```python
@staticmethod
@callback
def async_get_options_flow(
    config_entry: config_entries.ConfigEntry,
) -> config_entries.OptionsFlow:
    """Create the options flow."""
    return OptionsFlowHandler(config_entry)
```

## Flow handler

流处理程序的工作方式与配置流处理程序相同，唯一的区别是流中的第一步始终是`async_step_init`。

```python
class OptionsFlowHandler(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "show_things",
                        default=self.config_entry.options.get("show_things"),
                    ): bool
                }
            ),
        )
```

## Signal updates

如果集成需要对更新的选项进行操作，可以向配置条目注册一个更新监听器，在条目更新时调用该监听器。要注册监听器，请在集成的`__init__.py`文件中的`async_setup_entry`函数中添加以下内容。

```python
entry.async_on_unload(entry.add_update_listener(update_listener))
```


使用上述方式意味着在加载条目时会附加监听器，在卸载时会将其分离。监听器应该是一个异步函数，其输入与`async_setup_entry`相同。然后可以通过`entry.options`来访问选项。

```python
async def update_listener(hass, entry):
    """Handle options update."""
```
