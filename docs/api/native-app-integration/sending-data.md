---
title: "Sending data home"
---

一旦您已经使用移动应用程序组件注册了您的应用程序，您可以通过提供的 Webhook 信息与 Home Assistant 进行交互。

## 通过 Rest API 发送 Webhook 数据

第一步是将返回的 webhook ID 转换为完整 URL：`<instance_url>/api/webhook/<webhook_id>`。这将是我们所有交互所需的唯一 URL。Webhook 端点不需要身份验证的请求。

如果在注册过程中提供了 Cloudhook URL，您应该默认使用它，只有在该请求失败时才返回上述构建过的 URL。

如果在注册过程中提供了远程 UI URL，您应该在构建 URL 时将其作为 `instance_url` 使用，只有在远程 UI URL 失败时才使用用户提供的 URL。

总结一下，请求的发送方式如下：

1. 如果您有 Cloudhook URL，请使用该 URL，直到请求失败。请求失败后，转到步骤 2。
2. 如果您有远程 UI URL，请使用它来构建 Webhook URL：`<remote_ui_url>/api/webhook/<webhook_id>`。请求失败后，转到步骤 3。
3. 使用在设置过程中提供的实例 URL 构建 Webhook URL：`<instance_url>/api/webhook/<webhook_id>`。

## 通过 WebSocket API 发送 Webhook 数据

还可以通过发送 `webhook/handle` 命令将 Webhook 传递到 WebSocket API：

```json
{
  "type": "webhook/handle",
  "id": 5,
  "method": "GET",
  // Below fields are optional
  "body": "{\"hello\": \"world\"}",
  "headers": {
    "Content-Type": "application/json"
  },
  "query": "a=1&b=2",
}
```

The response will look as follows:

```json
{
  "type": "result",
  "id": 5,
  "result": {
    "body": "{\"ok\": true}",
    "status": 200,
    "headers": {"Content-Type": response.content_type},
  }
}
```

## 关于实例 URL 的简要说明

一些用户已经配置了可通过动态 DNS 服务在家庭网络之外进行访问的 Home Assistant。有一些路由器不支持头发回 / NAT loopback：即设备通过外部配置的 DNS 服务从路由器网络内部发送数据到 Home Assistant，Home Assistant 也位于本地网络内。

为了解决这个问题，应用程序应该记录用户的家庭网络是哪个 WiFi SSID，并在连接到家庭 WiFi 网络时使用直接连接。

## 基本交互

### 请求

所有的交互都是通过向 Webhook URL 发送 HTTP POST 请求来完成的。这些请求不需要包含身份验证信息。

负载数据的格式取决于交互类型，但它们都有一个共同的基础部分：

```json
{
  "type": "<type of message>",
  "data": {}
}
```

If you received a `secret` during registration, you **MUST** encrypt your message and put it in the payload like this:
如果您在注册过程中收到了一个 `secret`，您**MUST**加密您的消息并将其放入负载中，如下所示：

```json
{
  "type": "encrypted",
  "encrypted": true,
  "encrypted_data": "<encrypted message>"
}
```


### 响应

通常情况下，您可以预期收到所有请求的 200 响应。但也有一些情况下您可能会收到其他的响应码：

- 如果您的 JSON 无效，您将收到 400 状态码。但是，如果加密后的 JSON 无效，则不会收到此错误。
- 创建传感器时，您将收到 201 状态码。
- 如果收到 404 状态码，表示 `mobile_app` 组件可能未加载。
- 收到 410 状态码意味着集成已被删除。您应该通知用户，并很可能重新注册。

## 实现加密

`mobile_app` 支持通过 [Sodium](https://libsodium.gitbook.io/doc/) 进行双向加密通信。

:::info
Sodium 是一个现代、易于使用的软件库，用于加密、解密、签名、密码哈希等功能。
:::

### 选择库

大多数现代编程语言和平台都有用于封装 Sodium 的库。Sodium 本身是用 C 写的。

以下是我们建议使用的库，当然您也可以自由选择适合您的库：

- Swift/Objective-C: [swift-sodium](https://github.com/jedisct1/swift-sodium)（由 Sodium 开发人员维护的官方库）。

对于其他语言，请参阅 [其他语言的绑定库](https://doc.libsodium.org/bindings_for_other_languages)。如果有多个选择可用，我们建议选择最近更新并经过最多同行评审的选择（可以通过查看项目的 GitHub 星标数量来简单检查）。

### 配置

我们使用 Sodium 的 [密钥密文术](https://doc.libsodium.org/secret-key_cryptography) 功能来加密和解密负载数据。所有负载数据都以 Base64 的形式进行 JSON 编码。对于 Base64 类型，请使用 `sodium_base64_VARIANT_ORIGINAL`（即“original”，无填充，非 URL 安全）。如果未加密的负载数据中不包含 `data` 键（例如 [get_config](https://developers.home-assistant.io/docs/api/native-app-integration/sending-data#get-config) 请求），则必须加密一个空的 JSON 对象(`{}`)作为替代。

### 标志加密支持

有两种方式可以启用加密支持：

- **在初始注册期间**，将 `supports_encryption` 设置为 `true`。
- **在初始注册后**，调用 `enable_encryption` webhook 动作。

Home Assistant 实例必须能够安装 `libsodium` 以启用加密。通过初始注册或启用加密的响应中的 `secret` 键的存在，确认您应该通过加密方法进行所有未来的 webhook 请求。

您必须永久存储这个秘钥。无法通过 Home Assistant 用户界面恢复它，您也不应要求用户查看隐藏的存储文件以重新输入加密密钥。如果加密失败，请创建一个新的注册并警告用户。

由于 Home Assistant Core 侧缺乏 Sodium/NaCL ，初始注册可能不支持加密。应尽可能始终努力加密通信。因此，我们礼貌地要求您定期尝试自动启用加密，或者允许用户通过应用程序中的按钮手动启用加密。这样，他们可以首先尝试修复导致 Sodium/NaCL 无法安装的任何错误，然后以后再进行加密注册。如果 Sodium/NaCL 无法安装，Home Assistant Core 将记录详细的错误信息。

## 更新设备位置

这条消息将向 Home Assistant 提供新的位置信息。


```json
{
  "type": "update_location",
  "data": {
    "gps": [12.34, 56.78],
    "gps_accuracy": 120,
    "battery": 45
  }
}
```

| 键 | 类型 | 描述 |
| --- | ---- | ----------- |
| `location_name` | 字符串 | 设备所在区域的名称 |
| `gps` | 经纬度 | 当前位置的纬度和经度 |
| `gps_accuracy` | 整数 | GPS 精度，以米为单位。必须大于 0 |
| `battery` | 整数 | 设备剩余电量的百分比。必须大于 0 |
| `speed` | 整数 | 设备的速度，以米/秒为单位。必须大于 0 |
| `altitude` | 整数 | 设备的海拔高度，以米为单位。必须大于 0 |
| `course` | 整数 | 设备的行进方向，以角度表示，并相对于正北方向。必须大于 0 |
| `vertical_accuracy` | 整数 | 海拔高度值的准确度，以米为单位。必须大于 0 |

## 调用服务

调用 Home Assistant 中的服务。

```json
{
  "type": "call_service",
  "data": {
    "domain": "light",
    "service": "turn_on",
    "service_data": {
      "entity_id": "light.kitchen"
    }
  }
}
```
| 键 | 类型 | 描述 |
| --- | ---- | ----------- |
| `domain` | 字符串 | 服务所属的域 |
| `service` | 字符串 | 服务的名称 |
| `service_data` | 字典 | 发送到服务的数据 |

## 触发事件

在 Home Assistant 中触发事件。请注意遵循我们 [Data Science portal](https://data.home-assistant.io/docs/events/#database-table) 上记录的数据结构。


```json
{
  "type": "fire_event",
  "data": {
    "event_type": "my_custom_event",
    "event_data": {
      "something": 50
    }
  }
}
```

| 键 | 类型 | 描述 |
| --- | ---- | ----------- |
| `event_type` | 字符串 | 要触发的事件类型 |
| `event_data` | 字符串 | 要触发的事件数据 |

## 渲染模板

渲染一个或多个模板并返回结果。

```json
{
  "type": "render_template",
  "data": {
    "my_tpl": {
      "template": "Hello {{ name }}, you are {{ states('person.paulus') }}.",
      "variables": {
        "name": "Paulus"
      }
    }
  }
}
```

`data` 必须包含 `键`：`字典` 的映射，结果将以 `{"my_tpl": "Hello Paulus, you are home"}` 的形式返回。这允许在一次调用中渲染多个模板。

| 键 | 类型 | 描述 |
| --- | ---- | ----------- |
| `template` | 字符串 | 要渲染的模板 |
| `variables` | 字典 | 要包含的额外模板变量。 

## 更新注册信息

更新您的应用注册信息。如果应用版本发生变化或任何其他值发生变化，请使用此功能。

```json
{
  "type": "update_registration",
  "data": {
    "app_data": {
      "push_token": "abcd",
      "push_url": "https://push.mycool.app/push"
    },
    "app_version": "2.0.0",
    "device_name": "Robbies iPhone",
    "manufacturer": "Apple, Inc.",
    "model": "iPhone XR",
    "os_version": "23.02"
  }
}
```

所有键都是可选的。

| 键 | 类型 | 描述 |
| --- | --- | ----------- |
| `app_data` | 字典 | 如果应用程序具有支持扩展移动应用程序功能或希望启用通知平台的支持组件，则可以使用应用程序数据。
| `app_version` | 字符串 | 移动应用程序的版本。
| `device_name` | 字符串 | 运行应用程序的设备的名称。
| `manufacturer` | 字符串 | 运行应用程序的设备的制造商。
| `model` | 字符串 | 运行应用程序的设备的型号。
| `os_version` | 字符串 | 运行应用程序的设备的操作系统版本。

## 获取区域

获取所有已启用的区域。

```json
{
  "type": "get_zones"
}
```

## 获取配置

返回带有用于配置应用程序的值的 `/api/config` 的版本。

```json
{
  "type": "get_config"
}
```

## 启用加密

_这要求 Home Assistant 的版本不低于 0.106。_

为现有的注册启用加密支持。

```json
{
  "type": "enable_encryption"
}
```

可能会收到两种错误：

- `encryption_already_enabled` - 此注册已启用加密。
- `encryption_not_available` - 无法安装 Sodium/NaCL。请停止所有未来尝试启用加密。

## 流式传输摄像头

_这要求 Home Assistant 的版本不低于 0.112。_

检索有关如何流式传输摄像头的路径信息。

```json
{
  "type": "stream_camera",
  "data": {
    "camera_entity_id": "camera.name_here"
  }
}
```

| 键 | 类型 | 描述 |
| --- | ---- | ----------- |
| `camera_entity_id` | 字符串 | 要检索有关流式传输信息的摄像头实体

响应将包括通过 HLS 或通过 MJPEG 图像预览进行流式传输的路径。

```json
{
  "hls_path": "/api/hls/.../playlist.m3u8",
  "mjpeg_path": "/api/camera_proxy_stream/..."
}
```

如果不可用 HLS 流式传输，`hls_path` 将为 `null`。有关如何构建完整 URL 的实例 URL，请参阅上面的注释。

## 处理对话

_这要求 Home Assistant 的版本不低于 2023.2.0。_

使用对话集成处理句子。

```json
{
  "type": "conversation_process",
  "data": {
    "text": "Turn on the lights",
    "language": "en",
    "conversation_id": "ABCD",
  }
}
```

要了解可用的键和响应，请参阅[对话 API 文档](../../intent_conversation_api)。