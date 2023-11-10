---
title: "内核(Core) 架构"
sidebar_label: "内核(Core)"
---

Home Assistant 内核(Core) 包括四个主要部分.除此以外,还有许多辅助类来处理一些常见场景,比如定义一个实体或者处理位置信息.

- **Event Bus**: 事件总线,方便地触发和监听事件,是Home Assistant的心脏.
- **State Machine**: 状态机,保持跟踪事物的状态,并且当某状态被改变时,触发`state_changed`.
- **Service Registry**: 服务注册表,在事件总线上监听`call_service`事件,并允许其他代码注册可被调用的服务.
- **Timer**: 定时器,每1s,往事件总线发送一个`time_changed`事件.

<img class='invertDark'
  alt='Overview of the Home Assistant core architecture'
  src='/img/en/architecture/ha_architecture.svg'
/>
