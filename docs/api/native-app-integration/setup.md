---
title: "Connecting to an instance 连接实例"
---
当用户第一次打开应用时，他们需要连接到本地实例进行身份验证和设备注册。

## 用户身份验证

如果Home Assistant配置了[zeroconf集成]，可以通过搜索`_home-assistant._tcp.local.`来发现本地实例。如果未配置，则需要询问用户实例的本地地址。

一旦知道了实例的地址，应用程序将要求用户通过[OAuth2与Home Assistant]进行身份验证。Home Assistant使用IndieAuth，这意味着为了能够重定向到触发应用程序的URL，您需要采取一些额外的步骤。一定要仔细阅读“Clients”部分的最后一段。

[zeroconf集成]: https://www.home-assistant.io/integrations/zeroconf
[OAuth2与Home Assistant]: auth_api.md

## 设备注册

_这需要Home Assistant 0.90或更高版本。_

Home Assistant有一个`mobile_app`组件，允许应用程序注册自己并与实例进行交互。这是一个通用组件，用于处理大多数常见的移动应用程序任务。如果您的应用程序需要比此组件提供的更多类型的交互，则可以通过自定义交互来扩展此组件。

一旦您获得了作为用户进行身份验证的令牌，就可以将应用程序与Home Assistant中的移动应用程序集成注册。

### 准备工作

首先，确保已加载`mobile_app`集成。有两种方法可以做到这一点：

- 您可以发布一个Zeroconf/Bonjour记录`_hass-mobile-app._tcp.local.`来触发`mobile_app`集成的自动加载。在继续之前，应该等待至少60秒。
- 您可以要求用户将`mobile_app`添加到他们的configuration.yaml中并重新启动Home Assistant。如果用户已经在配置中有`default_config`，那么`mobile_app`已经被加载。

可以通过检查[`/api/config` REST API调用](/api/rest.md#get-apiconfig)的`components`数组来确认是否已加载`mobile_app`组件。如果继续设备注册并收到404状态码，则它很可能尚未加载。

### 注册设备

要注册设备，请进行经过身份验证的POST请求到`/api/mobile_app/registrations`。[有关进行经过身份验证的请求的更多信息。](/auth_api.md#making-authenticated-requests)

发送到注册端点的示例有效载荷：

```json
{
  "device_id": "ABCDEFGH",
  "app_id": "awesome_home",
  "app_name": "Awesome Home",
  "app_version": "1.2.0",
  "device_name": "Robbies iPhone",
  "manufacturer": "Apple, Inc.",
  "model": "iPhone X",
  "os_name": "iOS",
  "os_version": "iOS 10.12",
  "supports_encryption": true,
  "app_data": {
    "push_notification_key": "abcdef"
  }
}
```
请参考以下翻译：

| Key                   | Required | Type   | Description                                                                                                                  |
| --------------------- | -------- | ------ | ---------------------------------------------------------------------------------------------------                          |
| `device_id`           | 是        | 字符串 | 该设备的唯一标识符。Home Assistant 0.104新增。                                                              |
| `app_id`              | 是        | 字符串 | 该应用的唯一标识符。                                                                                                      |
| `app_name`            | 是        | 字符串 | 移动应用的名称。                                                                                                      |
| `app_version`         | 是        | 字符串 | 移动应用的版本号。                                                                                                   |
| `device_name`         | 是        | 字符串 | 运行该应用的设备名称。                                                                                          |
| `manufacturer`        | 是        | 字符串 | 运行该应用的设备的制造商。                                                                              |
| `model`               | 是        | 字符串 | 运行该应用的设备型号。                                                                                     |
| `os_name`             | 是        | 字符串 | 运行该应用的操作系统名称。                                                                                          |
| `os_version`          | 是        | 字符串 | 运行该应用的设备的操作系统版本。                                                                                |
| `supports_encryption` | 是        | 布尔值   | 应用是否支持加密。详见[encryption](/api/native-app-integration/sending-data.md#implementing-encryption)。  |
| `app_data`            |          | 字典   | 如果该应用有扩展`mobile_app`功能的支持组件，可以使用应用数据。                          |

当您收到一个200响应时，移动应用已经在Home Assistant中注册成功。响应是一个JSON文档，其中包含与Home Assistant实例交互的URL。您应该永久存储这些信息。

```json
{
  "cloudhook_url": "https://hooks.nabu.casa/randomlongstring123",
  "remote_ui_url": "https://randomlongstring123.ui.nabu.casa",
  "secret": "qwerty",
  "webhook_id": "abcdefgh"
}
```

请参考以下翻译：

| Key             | Type   | Description                                                                                                                                      |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cloudhook_url` | 字符串 | Home Assistant Cloud 提供的云钩子 URL。仅当用户订阅了 Nabu Casa 时才会提供。                                                            |
| `remote_ui_url` | 字符串 | Home Assistant Cloud 提供的远程 UI URL。仅当用户订阅了 Nabu Casa 时才会提供。                                                            |
| `secret`        | 字符串 | 用于加密通信的密钥。仅在应用和 Home Assistant 实例都支持加密时才会包含。详见 [更多信息](/api/native-app-integration/sending-data.md#implementing-encryption)。 |
| `webhook_id`    | 字符串 | 可用于发送数据的 Webhook ID。                                                                                                                            |