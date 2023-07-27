---
title: "集成的文件结构"
sidebar_label: "文件结构"
---

每个集成都存储在以集成域(Domain)命名的目录中. 域是一个由字符和下划线组成的短名称. 此域必须是唯一的, 且不能更改. 例如,移动应用程序集成的域为`mobile_app`. 因此,该集成的所有文件都在`mobile_app/`文件夹中.

最小可执行集成的文件结构如下:

- `manifest.json`: 清单(manifest)文件描述了集成及其依赖项. [更多信息](creating_integration_manifest.md)
- `__init__.py`: 组件(component)文件. ***TODO:理解不明确*** 如果集成只提供一个平台, 则可以将此文件限制为介绍集成的文档字符串(docstring)`"""The Mobile App integration."""`.

## 添加各种设备 - `light.py`, `switch.py` 等

如果您的集成要添加一个或多个设备, 您需要创建一个与实体集成(entity integration)交互的平台(platform). 例如,如果您想在Home Assistant中表示一个灯光设备(light device), 则需要创建`light.py`, 该文件将包含一个灯光平台(light platform), 用于灯光集成(light integration). 该平台(light platform)将负责与灯光设备(light device)交互, 并将其表示为实体(entity). 

- 更多信息 [可用的实体集成](core/entity.md).
- 更多信息 [创建平台](creating_platform_index.md).

## 添加服务 - `services.yaml`

如果您的集成要注册服务, 则需要提供可用服务的描述. 描述存储在`services.yaml`中. [更多信息](dev_101_services.md)

## Home Assistant在哪里查找集成
当Home Assistant发现配置文件中引用了目标集成的域(例如`mobile_app:`), 或者另一个集成依赖目标集成时, 将查找这个集成. Home Assistant将查找以下位置:

- `<config directory>/custom_components/<domain>`
- `homeassistant/components/<domain>` (内建集成)

您也可以覆盖内建集成,只需要在`<config directory>/custom_components` 文件夹中创建新集成,并使用和被覆盖集成同样的域即可. [如果您需要覆盖内核集成,需要在`manifest.json`文件中增加版本标签(version tag)](creating_integration_manifest/#version). 想要区分一个被覆盖的核心集成,只需要注意集成框的右上角有一个特定的图标. [![打开你的Home Assistant实例并显示你的集成.](https://my.home-assistant.io/badges/integrations.svg)](https://my.home-assistant.io/redirect/integrations/)

不建议覆盖内建集成,这样您将无法获得更新. 建议给域起一个唯一的名称.
