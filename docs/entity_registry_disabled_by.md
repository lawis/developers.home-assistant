---
title: Entity Registry and disabling entities 实体注册表和禁用实体
sidebar_label: Disabling entities
---

实体注册表跟踪具有唯一 ID 的所有实体。对于每个实体，注册表将跟踪影响实体与核心交互的选项。其中之一选项是 `disabled_by`。

当设置了 `disabled_by` 且不为 `None` 时，当集成将实体传递给 `async_add_entities` 时，该实体将不会被添加到 Home Assistant。

## 集成架构

集成需要确保在实体禁用时能够正常工作。如果您的集成保留了对创建的实体对象的引用，您应该仅在实体的生命周期方法 `async_added_to_hass` 中注册这些引用。只有当实体实际添加到 Home Assistant 时（即未被禁用），才会调用该生命周期方法。

实体禁用适用于通过配置项或通过 configuration.yaml 中的条目提供的实体。如果您的集成通过配置条目进行设置并支持[卸载](config_entries_index.md#unloading-entries)，Home Assistant 将能够在启用/禁用实体后重新加载您的集成以应用更改而无需重启。

## 用户编辑实体注册表

用户通过 UI 编辑实体注册表是禁用实体的一种方式。在这种情况下，`disabled_by` 值将设置为 `RegistryEntryDisabler.USER`。这仅适用于已经注册的实体。

## 集成设置新实体注册表条目的 disabled_by 默认值

作为集成，您可以控制在首次注册实体时实体是否启用。这由 `entity_registry_enabled_default` 属性控制。它的默认值为 `True`，这意味着实体将启用。

如果该属性返回 `False`，则将新注册实体的 `disabled_by` 值设置为 `RegistryEntryDisabler.INTEGRATION`。

## 配置条目系统选项设置新实体注册表条目的 disabled_by 默认值

用户还可以通过将配置条目的系统选项 `disable_new_entities` 设置为 `True` 来控制与配置条目相关的新实体的接收方式。这可以通过 UI 完成。

如果正在注册实体并且此系统选项设置为 `True`，那么 `disabled_by` 属性将初始化为 `RegistryEntryDisabler.CONFIG_ENTRY`。

如果 `disable_new_entities` 设置为 `True` 并且 `entity_registry_enabled_default` 返回 `False`，则 `disabled_by` 值将设置为 `RegistryEntryDisabler.INTEGRATION`。

## Integrations offering options to control disabled_by

某些集成可能希望向用户提供选项来控制添加到 Home Assistant 的实体。例如，Unifi 集成提供了启用/禁用无线和有线客户端的选项。

集成可以通过 [configuration.yaml](/configuration_yaml_index.md) 或使用 [Options Flow](/config_entries_options_flow_handler.md) 向用户提供选项。

如果集成提供了此选项，则不应使用实体注册表中的 disabled_by 属性。相反，如果实体通过配置选项流禁用，请从设备和实体注册表中删除它们。