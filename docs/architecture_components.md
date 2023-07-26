---
title: "集成(Integration)架构"
sidebar_label: "集成(Integrations)"
---


Home Assistant (内核) 可以通过**集成(Integrations)**扩展. 每一个集成负责Home Assistant中的特定域. 集成(Integrations)可以监听或触发事件,提供服务并维护状态. 集成(Integrations)由组件(Component)(基本逻辑)和平台(与其他集成(Integrations)集成的部分)组成. 集成(Integrations)是用Python编写的,可以发挥 Python 所提供的所有优点. Home Assistant提供了非常多的[内置集成](https://www.home-assistant.io/integrations/).

<img class='invertDark'
src='/img/en/architecture/component-interaction.svg'
alt='Diagram showing interaction between integrations and the Home Assistant core.' />

Home Assistant 有以下几种类型的集成(Integrations):

## 定义一个物联网域

这些集成(Integrations)定义了Home Assistant中的设备(Devices)类别. 比如,`light`集成(Integrations)定义了**灯**这类设备域,在Home Assistant中可用的数据以及数据的标准格式. 它还提供了对应的服务(Services),可以对灯进行各种控制.

已经定义好的域的列表, 请查看 [实体(Entities)](./core/entity.md).

如果您建议增加一个新的域,可以在[架构版本库](https://github.com/home-assistant/architecture/discussions)中讨论. 请确保提交的信息包含实体数据和如何控制,最好能有多个品牌的产品示例.

## 与外部设备和服务交互

这些集成(Integrations)与外部设备以及服务交互,并且按照Home Assistant定义好的物联网域(例如上面说到的`light`域)来组织数据和格式,这样就可以用HomeAssistant来使用这些外部设备和服务了.
Philips Hue(HA中的一个集成名字) 就是一个这种集成, 它可以让Philips Hue(飞利浦调光灯的品牌)的各种灯做为light实体(Entities)在Home Assistant中正常工作.

获取更多信息,请查看[实体(entity)架构](architecture/devices-and-services.md).

## 代表纯虚拟的数据节点或者基于已有数据加工后的数据节点

这些集成所表示的实体(entities),要不全部基于虚拟数据(比如[`input_boolean`集成](https://www.home-assistant.io/integrations/input_boolean/), 或者一个 virtual switch),要不基于HA中其他可用数据加工后的数据(比如 [`template` 集成](https://www.home-assistant.io/integrations/template/) 或者 [`utility_meter` 集成](https://www.home-assistant.io/integrations/utility_meter/)).

## 由用户触发或者通过事件响应的操作.

这些集成提供了一些小的自动化逻辑,用于在房子中完成一些常见的任务. 其中最有代表性的就是[`automation` 集成](https://www.home-assistant.io/integrations/automation/), 它让用户可以通过一些标准的配置来创建自动化.

当然,这些集成也可以干一些更具体的自动化工作,比如 [`flux` 集成](https://www.home-assistant.io/integrations/flux/), 它实现的功能仅仅是根据太阳的位置来控制灯的亮度.
