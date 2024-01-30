---
title: "Entities: integrating devices & services"
sidebar_label: "Introduction"
---

集成可以表示家庭助手中的设备和服务。数据点由实体表示。实体由其他集成（例如`light`、`switch`等）标准化。标准化实体可以提供控制服务，但是集成也可以提供自己的服务，以防某些内容未标准化。

实体将家庭助手的内部工作抽象化。作为一个集成者，你不必担心服务或状态机的工作原理。相反，你可以扩展实体类并实现与你要集成的设备类型相关的必要属性和方法。

<img className='invertDark'
  src='/img/en/architecture/integrating-devices-services.svg'
  alt='Integrating devices & services' />

<!--
  https://docs.google.com/drawings/d/1oysZ1VMcPPuyKhY4tequsBWcblDdLydbWxlu6bH6678/edit?usp=sharing
-->
提供给用户的配置可以通过[配置项](../config_entries_index.md)或特殊/传统情况下的[configuration.yaml](../configuration_yaml_index.md)进行设置。

设备集成（如`hue`）将使用此配置与设备/服务建立连接。它将将配置项（传统使用的是发现助手）转发给其相应的集成（如灯光、开关）以设置其实体。设备集成还可以注册自己的服务，用于标准化之外的内容。这些服务发布在集成的域名下，例如`hue.activate_scene`。

实体集成（如`light`）负责定义抽象实体类和服务，用于控制实体。

实体组件助手负责将配置分发给平台，转发发现并收集服务调用的实体。

实体平台助手管理平台的所有实体，并在必要时对其进行轮询以获取更新。在添加实体时，实体平台负责向设备和实体注册表注册实体。

集成平台（如`hue.light`）使用配置查询外部设备/服务并创建要添加的实体。集成平台还可以注册实体服务。这些服务将在实体集成的设备集成下的所有实体（如所有Hue灯光实体）上工作。这些服务在设备集成域名下发布。

## 实体与Home Assistant Core的交互

继承自实体基类的集成实体类负责获取数据和处理服务调用。如果禁用了轮询，它还负责告诉Home Assistant何时有数据可用。

<img className='invertDark'
  src='/img/en/architecture/entity-core-interaction.svg'
  alt='Entities interacting with core' />

<!--
  https://docs.google.com/drawings/d/12Z0t6hriYrQZ2L5Ou7BVhPDd9iGvOvFiGniX5sgqsE4/edit?usp=sharing
-->

The entity base class (defined by the entity integration)  is responsible for formatting the data and writing it to the state machine.
实体基类（由实体集成定义）负责格式化数据并将其写入状态机。

The entity registry will write an `unavailable` state for any registered entity that is not currently backed by an entity object.
实体注册表将为任何已注册的实体（目前没有被实体对象支持）写入`unavailable`状态。

## Entity data hierarchy

<img className='invertDark'
  style={{maxWidth: "200px"}}
  src='/img/en/architecture/entity-data-hierarchy.svg'
  alt='Entity hierarchy' />

<!--
  https://docs.google.com/drawings/d/1TorZABszaj3m7tgTyf-EMrheYCj3HAvwXB8YmJW5NZ4/edit?usp=sharing
-->

Delete, disable or re-enable any object and all objects below will be adjusted accordingly.
删除、禁用或重新启用任何对象，所有下面的对象将相应进行调整。