---
title: "Integration Platforms"
sidebar_label: "Platforms"
---

Home Assistant具有各种内置的集成，用于抽象设备类型。包括[灯光](core/entity/light.md)、[开关](core/entity/switch.md)、[遮罩](core/entity/cover.md)、[气候设备](core/entity/climate.md)等等。你的集成可以通过创建平台来连接到这些集成。您需要为每个要集成的集成创建一个平台。

要创建一个平台，您需要创建一个与您正在构建平台的集成的域名相对应的文件。例如，如果您正在构建一个灯光集成，您将在集成文件夹中添加一个名为 `light.py` 的新文件。

我们已经创建了两个示例集成，供您了解其工作方式：

- [Example sensor platform](https://github.com/home-assistant/example-custom-config/tree/master/custom_components/example_sensor/): 平台的hello world。
- [Example light platform](https://github.com/home-assistant/example-custom-config/tree/master/custom_components/example_light/): 展示最佳实践。

### 与设备接口

Home Assistant的一个规则是，集成不应直接与设备接口直接相连。相反，它应与第三方的Python 3库进行交互。这样，Home Assistant可以与Python社区共享代码，并保持项目的可维护性。

一旦您的Python库准备好并发布到PyPI，将其添加到[清单](creating_integration_manifest.md)中。现在是时候实现由您创建平台所提供的实体基类了。

在[实体索引](core/entity.md)中找到您的集成，以了解可供实现的方法和属性。