---
title: "Intents 意图说明"
sidebar_label: "Introduction 说明"
---


意图是对用户意图的描述。意图由用户的操作生成，例如要求Amazon Echo打开灯光。

<a href='https://docs.google.com/drawings/d/1i9AsOQNCBCaeM14QwEglZizV0lZiWKHZgroZc9izB0E/edit'>
  <img class='invertDark'
    src='/img/en/intents/overview.png'
    alt='Architectural overview of intents in Home Assistant'
  />
</a>
意图由接收它们的组件从外部来源/服务触发。目前，对话、Alexa、API.ai和Snips是意图的信息来源。

任何组件都可以处理意图。这使得开发人员可以很容易地一次性与所有语音助手集成。

使用`homeassistant.helpers.intent.Intent`类来实现意图。它包含以下属性：

| 名称          | 类型             | 描述                                                                             |
|---------------|------------------|---------------------------------------------------------------------------------|
| `hass`        | Home Assistant   | 触发意图的Home Assistant实例。                                                 |
| `platform`    | string           | 触发意图的平台。                                                                 |
| `intent_type` | string           | 意图的类型（名称）。                                                             |
| `slots`       | dictionary       | 包含按插槽名称索引的插槽值的字典。                                               |
| `text_input`  | string           | 可选。启动意图的原始文本输入。                                                   |
| `language`    | string           | 可选。文本输入的语言（默认为配置的语言）。                                       |

插槽字典值的描述。

| 名称  | 类型     | 描述                  |
|-------|----------|----------------------|
| Value | 任意类型 | 插槽的值。            |