---
title: Device Tracker Entity
sidebar_label: Device Tracker
---

设备跟踪器（Device Tracker）是一个只读实体，提供了设备的存在状态信息。设备跟踪器实体有两种类型，即 ScannerEntity 和 TrackerEntity。

## ScannerEntity

ScannerEntity 报告了本地网络上设备的连接状态。如果设备已连接，则 ScannerEntity 的状态为 `home`，如果设备未连接，则状态为 `not_home`。

从 [`homeassistant.components.device_tracker.config_entry.ScannerEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/device_tracker/config_entry.py) 派生平台实体。

### 属性

:::tip
属性应仅从内存中返回信息，而不执行 I/O 操作（例如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

:::caution
ScannerEntity 不支持属性缩写的 [属性实现](../entity.md#entity-class-or-instance-attributes)。
:::

| 名称             | 类型       | 默认值        | 描述                                                    |
| --------------- | ---------- | ------------ | ------------------------------------------------------ |
| source_type     | SourceType | **必需**      | 设备的源类型，例如 `gps` 或 `router`。                        |
| is_connected    | 布尔型       | **必需**      | 设备的连接状态。                                         |
| battery_level   | 整型         | `None`       | 设备的电池电量。                                         |
| ip_address      | 字符串       | `None`       | 设备的 IP 地址。                                       |
| mac_address     | 字符串       | `None`       | 设备的 MAC 地址。                                      |
| hostname        | 字符串       | `None`       | 设备的主机名。                                         |

### DHCP 发现

如果设备跟踪器的 `source_type` 是 `router`，并且已设置 `ip_address`、`mac_address` 和 `hostname` 属性，则数据将加速 `DHCP 发现`，因为系统无需等待 DHCP 发现数据包即可找到现有设备。

## TrackerEntity

TrackerEntity 跟踪设备的位置，并将其报告为位置名称、区域名称或 `home`、`not_home` 状态。TrackerEntity 通常接收 GPS 坐标以确定其状态。

从 [`homeassistant.components.device_tracker.config_entry.TrackerEntity`](https://github.com/home-assistant/core/blob/dev/homeassistant/components/device_tracker/config_entry.py) 派生平台实体。

### 属性

:::tip
属性应仅从内存中返回信息，而不执行 I/O 操作（例如网络请求）。实现 `update()` 或 `async_update()` 来获取数据。
:::

:::caution
TrackerEntity 不支持属性缩写的 [属性实现](../entity.md#entity-class-or-instance-attributes)。
:::

| 名称              | 类型       | 默认值        | 描述                                                       |
| ---------------- | ---------- | ------------ | -------------------------------------------------------- |
| source_type      | SourceType | **必需**      | 设备的源类型，例如 `gps` 或 `router`。                             |
| latitude         | 浮点型        | **必需**      | 设备的纬度坐标。                                          |
| longitude        | 浮点型        | **必需**      | 设备的经度坐标。                                          |
| battery_level    | 整型         | `None`       | 设备的电池电量。                                          |
| location_accuracy | 整型         | `None`       | 设备位置的精确度（以米为单位）。                                 |
| location_name     | 字符串       | `None`       | 设备的位置名称。                                          |