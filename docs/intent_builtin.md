---
title: "Built-in intents 内置意图"
toc_max_heading_level: 2
---

import intents from '!!yaml-loader!../intents/intents.yaml';

以下意图受支持：

  * HassTurnOn（打开设备）、HassTurnOff（关闭设备）、HassGetState（获取设备状态）、HassLightSet（设置灯光）

以下意图已弃用：

 * HassOpenCover（打开遮盖物）、HassCloseCover（关闭遮盖物）、HassToggle（切换设备状态）、HassHumidifierSetpoint（设置加湿器目标值）、HassHumidifierMode（设置加湿器模式）、HassShoppingListAddItem（添加物品到购物清单）、HassShoppingListLastItems（获取最近添加的物品）

**插槽**

对于*HassTurnOn*和*HassTurnOff*意图，插槽是可选的。

可能的插槽组合有:


    | 插槽组合        | 示例                          |
    | ----------------------- | --------------------------------- |
    | 仅名称               | 台灯                      |
    | 仅区域               | 厨房                          |
    | 区域和名称           | 客厅阅读灯        |
    | 区域和域           | 厨房灯                   |
    | 区域和设备类别   | 浴室湿度                |
    | 设备类别和域 | 二氧化碳传感器           |


## 支持的意图

<>
{
  Object.entries(intents)
  .filter(([intent, info]) => !intent.startsWith("HassClimate"))
  .map(
    ([intent, info]) =>
      <>
        <h3>{intent}</h3>
        <p>{info.description}</p>
        <b>Slots</b>
        {info.slots && (
          <ul>
            {Object.entries(info.slots).map(([slot, slotInfo]) => (
              <li>
                <b>{slot}</b> - {slotInfo.description}
              </li>
            ))}
          </ul>
        )}
        <p><small>
          <a href={`https://www.home-assistant.io/integrations/${info.domain}`}>Provided by the <code>{info.domain}</code> integration.</a>
        </small></p>
      </>
  )
}
</>

## 已弃用的意图

这些是不受模板匹配句子支持的旧意图，计划将其删除或替换。


### HassOpenCover

_已弃用；请改用`HassTurnOn`代替。_

打开遮盖物。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| name | string | 是 | 要打开的遮盖物实体的名称。|

### HassCloseCover

_已弃用；请改用`HassTurnOff`代替。_

关闭遮盖物。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| name | string | 是 | 要关闭的遮盖物实体的名称。|

### HassToggle

切换实体的状态。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| name | string | 是 | 要切换的实体的名称。|

### HassHumidifierSetpoint

设置目标湿度。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| name | string | 是 | 要控制的实体的名称。|
| humidity | 整数, 0-100 | 是 | 要设置的目标湿度值。|

### HassHumidifierMode

如果加湿器支持，设置加湿器模式。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| name | string | 是 | 要控制的实体的名称。|
| mode | string | 是 | 要切换到的模式。|

### HassShoppingListAddItem

将物品添加到购物清单。

| 插槽名称 | 类型 | 是否必填 | 描述 |
| --------- | ---- | -------- | ---- |
| item | string | 是 | 要添加到清单的物品的名称。|

### HassShoppingListLastItems

列出购物清单上的最后5个物品。

_此意图没有插槽。_



[This page is automatically generated based on the Intents repository.](https://github.com/home-assistant/intents/blob/main/intents.yaml)
