---
title: "通过 YAML 进行集成配置"
---

`configuration.yaml`是用户定义的配置文件。在首次运行Home Assistant时，它会被自动创建。它定义了要加载哪些组件。

:::info 关于设备和/或服务的YAML说明

与设备和/或服务通信的集成是通过配置流进行配置的。在极少数情况下，我们可以做出例外。允许并鼓励应该不具有YAML配置的现有集成实施配置流，移除YAML支持。不再接受对这些现有集成的YAML配置的更改。


For more detail read [ADR-0010](https://github.com/home-assistant/architecture/blob/master/adr/0010-integration-configuration.md#decision)
:::

## 预处理

Home Assistant将根据指定要加载的组件对配置进行一些预处理。

### CONFIG_SCHEMA

如果组件定义了变量 `CONFIG_SCHEMA`，那么传入的配置对象将是通过 `CONFIG_SCHEMA` 处理后的结果。`CONFIG_SCHEMA` 应该是一个 voluptuous 模式。

### PLATFORM_SCHEMA

如果组件定义了变量 `PLATFORM_SCHEMA`，那么该组件将被视为实体组件。实体组件的配置是平台配置的列表。

Home Assistant将收集该组件的所有平台配置。它会查找组件域下的配置条目（例如 `light`），还会查找域 + 额外文本的任何条目。

在收集平台配置时，Home Assistant会对其进行验证。它会检查平台是否存在，以及平台是否定义了 `PLATFORM_SCHEMA`，然后根据该模式对配置进行验证。如果未定义，它将根据组件中定义的 `PLATFORM_SCHEMA` 对配置进行验证。任何引用不存在平台或包含无效配置的配置都将被移除。


The following `configuration.yaml`:

```yaml
unrelated_component:
  some_key: some_value

switch:
  platform: example1

switch living room:
  - platform: example2
    some_config: true
  - platform: invalid_platform
```

will be passed to the component as

```python
{
    "unrelated_component": {
        "some_key": "some_value"
    },
    "switch": [
        {
            "platform": "example1"
        },
        {
            "platform": "example2",
            "some_config": True
        }
    ],
}
```
