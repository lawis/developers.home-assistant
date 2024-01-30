---
title: "Listening for events 监听事件"
---

您的集成可能需要在Home Assistant内发生特定事件时采取行动。Home Assistant提供了事件助手，用于监听特定事件类型，并直接访问事件总线。这些助手经过高度优化，以最大程度地减少回调次数。如果已经有针对您需要监听的特定事件的助手，则最好使用该助手，而不是直接监听事件总线。

## 可用的事件助手

事件助手位于`homeassistant.helpers.event`命名空间中。这些函数返回一个可取消的可调用对象。

这些函数的同步版本也可在没有 `async_` 前缀的情况下使用。

### Example

```python3
unsub = async_track_state_change_event(hass, entity_ids, state_automation_listener)
unsub()
```
### 跟踪实体状态变化

| 函数名                             | 使用情况
| ---------------------------------- | --------------------------------------------------------------------------
| `async_track_state_change`          | 跟踪特定状态的变化
| `async_track_state_change_event`    | 根据实体ID跟踪特定状态变化事件
| `async_track_state_added_domain`    | 当实体添加到领域时跟踪状态变化事件
| `async_track_state_removed_domain`  | 当实体从领域中移除时跟踪状态变化事件
| `async_track_state_change_filtered` | 使用可更新的 TrackStates 过滤器跟踪状态变化
| `async_track_same_state`            | 跟踪实体一段时间的状态并执行相应操作

### 跟踪模板变化

| 函数名                             | 使用情况
| ---------------------------------- | --------------------------------------------------------------------------
| `async_track_template`              | 在模板评估为“true”时触发监听器
| `async_track_template_result`       | 在模板结果发生变化时触发监听器

### 跟踪实体注册表变化

| 函数名                                    | 使用情况
| ----------------------------------------- | --------------------------------------------------------------------------
| `async_track_entity_registry_updated_event` | 根据实体ID跟踪特定实体注册表更新事件

### 跟踪时间变化

| 函数名                                    | 使用情况
| ----------------------------------------- | --------------------------------------------------------------------------
| `async_track_point_in_time`                 | 在特定时间点触发一次监听器
| `async_track_point_in_utc_time`             | 在特定的UTC时间点触发一次监听器
| `async_call_later`                          | 延迟触发的监听器
| `async_track_time_interval`                 | 在每个时间间隔重复触发的监听器
| `async_track_utc_time_change`               | 如果时间匹配模式，则触发监听器
| `async_track_time_change`                   | 如果本地时间匹配模式，则触发监听器

### 跟踪太阳位置变化

| 函数名                                    | 使用情况
| ----------------------------------------- | --------------------------------------------------------------------------
| `async_track_sunrise`                       | 每天日出时触发的监听器
| `async_track_sunset`                        | 每天日落时触发的监听器

## 直接监听事件总线

有两个可用的函数用于创建监听器。这两个函数返回一个可取消的可调用对象。

- `async_listen_once` - 仅监听一次事件，然后不再触发
- `async_listen` - 监听直到被取消

`async_listen`很少被使用，因为`EVENT_HOMEASSISTANT_START`、`EVENT_HOMEASSISTANT_STARTED`和`EVENT_HOMEASSISTANT_STOP`每次运行时只触发一次。

### Async context

```python3
cancel = hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, disconnect_service)
cancel()
```

```python3
cancel = hass.bus.async_listen(EVENT_STATE_CHANGED, forward_event)
cancel()
```

### Sync context
```python3
cancel = hass.bus.listen_once(EVENT_HOMEASSISTANT_STOP, disconnect_service)
cancel()
```

```python3
cancel = hass.bus.listen(EVENT_STATE_CHANGED, forward_event)
cancel()
```

常见事件

以下事件通常直接进行监听。

| 事件名称                          | 描述
| --------------------------------- | --------------------------------------------------------------------------
| `EVENT_HOMEASSISTANT_START`       | 完成设置并进入启动阶段
| `EVENT_HOMEASSISTANT_STARTED`     | 完成启动阶段，并且所有集成都有机会进行加载；主要由语音助手和将状态导出到外部服务的集成使用
| `EVENT_HOMEASSISTANT_STOP`        | 进入停止阶段

其他事件

除非集成是核心的一部分，否则很少直接监听这些事件。通常情况下，会有可用的帮助函数来处理这些事件，因此不应该直接监听它们。

| 事件名称                          | 描述                                      | 首选帮助函数
| --------------------------------- | -------------------------------------------- | ----------------------------
| `EVENT_HOMEASSISTANT_FINAL_WRITE` | 写入数据到磁盘的最后机会                   | 
| `EVENT_HOMEASSISTANT_CLOSE`       | 拆除                                     | 
| `EVENT_COMPONENT_LOADED`          | 集成已完成加载                           | `homeassistant.helpers.start.async_at_start`
| `EVENT_SERVICE_REGISTERED`        | 注册了新服务                              |
| `EVENT_SERVICE_REMOVED`           | 移除了服务                                |
| `EVENT_CALL_SERVICE`              | 调用了服务                                |
| `EVENT_STATE_CHANGED`             | 实体的状态已更改                           | [跟踪实体状态的变化](#tracking-entity-state-changes)
| `EVENT_THEMES_UPDATED`            | 主题已更新                                |
| `EVENT_CORE_CONFIG_UPDATE`        | 核心配置已更新                             |
| `EVENT_ENTITY_REGISTRY_UPDATED`   | 实体注册表已更新                           | [跟踪实体注册表的变化](#tracking-entity-registry-changes)