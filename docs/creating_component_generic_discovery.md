---
title: "Integration with Multiple Platforms 集成到多个平台"
sidebar_label: Multiple platforms
---

大多数集成由一个平台组成。在这种情况下，只定义一个平台是可以的。然而，如果您要添加第二个平台，您将希望集中管理连接逻辑。这是在组件（`__init__.py`）内完成的。

如果您的集成可以通过`configuration.yaml`进行配置，那么配置文件的入口点将会发生改变。现在用户需要直接设置您的集成，而由您的集成来设置平台。

## 通过配置项设置平台

如果您的集成是通过配置项设置的，您将需要将配置项传递给适当的集成以设置平台。有关更多信息，请参阅[配置项文档](config_entries_index.md#for-platforms)。

## 通过 configuration.yaml 设置平台

如果您的集成不使用配置项，它将需要使用我们的自动发现助手来设置其平台。请注意，此方法不支持卸载。

为此，您需要使用自动发现助手的`load_platform`和`async_load_platform`方法。

- 参见一个[实现此逻辑的完整示例](https://github.com/home-assistant/example-custom-config/tree/master/custom_components/example_load_platform/)。