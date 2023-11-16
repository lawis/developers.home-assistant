---
title: Entity Registry 实体注册
---

实体注册表是 Home Assistant 用来跟踪实体的注册表。任何添加到 Home Assistant 的实体，只要指定了[`unique_id`属性](/core/entity.md#generic-properties)，都将在注册表中注册。

注册有一个优势，即相同的实体始终会获得相同的实体 ID。它还可以防止其他实体使用该实体 ID。

用户还可以在实体注册表中覆盖实体的名称。一旦设置，实体注册表中的名称将优先于设备自身的名称。

## 唯一 ID

重要的是，用户不能更改唯一 ID，因为系统将丢失与唯一 ID 相关的所有设置。

实体在注册表中的查找是基于平台类型（例如`light`）、集成名称（域）（例如 hue）和实体的唯一 ID 的组合。实体的唯一 ID 不应包含域（例如 `your_integration`）和平台类型（例如 `light`），因为系统已经考虑了这些标识符。

如果设备具有单个唯一 ID，但提供多个实体，请将唯一 ID 与实体的唯一标识符结合使用。例如，如果设备同时测量温度和湿度，您可以使用 `{unique_id}-{sensor_type}` 来唯一标识实体。

## 唯一 ID 的要求

### 可接受的唯一 ID 示例来源

- 设备的序列号
- MAC 地址：使用 `homeassistant.helpers.device_registry.format_mac` 进行格式化；只能从设备 API 或发现处理程序获取 MAC 地址。依赖于读取 arp 缓存或本地网络访问的工具，例如 `getmac`，在所有支持的网络环境中都无法正常工作，因此不可接受。
- 纬度和经度或其他唯一地理位置
- 设备上物理打印或烧入 EEPROM 的唯一标识符

### 最后的唯一 ID

对于由配置项设置的实体，如果没有其他唯一 ID 可用，可以使用“配置项 ID”作为最后的选择。

### 不能接受的唯一 ID 来源

- IP Address
- Device Name
- Hostname
- URL
- Email addresses
- Usernames
