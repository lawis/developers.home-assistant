---
title: "架构概述"
---

Home Assistant 提供了一个家庭控制和家庭自动化的平台. Home Assistant 不仅是个应应程序,它还是一个嵌入式系统,能提供消费品级别的用户体验.通过一个用户界面就可以轻松的完成登录配置更新等操作.

- [操作系统(operating system)](operating-system.md) 提供了最精简的Linux环境用于运行监管器(Supervisor)和内核(Core).
- [监管器(Supervisor)](supervisor.md) 用于管理操作系统(operating system)
- [内核(Core)](architecture/core.md) 用于和用户,监管器(Supervisor),IoT设备,服务等交互.

<img
  src='/img/en/architecture/full.svg'
  alt='Full picture of Home Assistant'
/>

## 只运行以上部分功能

用户对家庭自动化平台的需求各不相同.这就是我们允许只运行(Home Assistant stack)部分功能的原因.更多信息,请参考[安装说明](https://www.home-assistant.io/installation/).
