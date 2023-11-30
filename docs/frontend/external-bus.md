---
title: "External Bus"
---
前端能够与嵌入Home Assistant前端的外部应用程序建立消息总线。这个系统是[外部身份验证](frontend/external-authentication.md)的概括，使得在将来添加更多命令时更加容易，无需在应用程序或前端方面进行大量改动。

## 消息交换

与外部身份验证类似，消息交换是通过外部应用程序提供一个JavaScript方法实现的。

消息以序列化的JSON对象形式传递给外部应用程序。将被调用的函数接受一个参数：一个字符串。外部应用程序将处理并相应地处理消息（或忽略）。

在Android上，您的应用程序需要定义以下方法：

```ts
window.externalApp.externalBus(message: string)
```

在iOS上，您的应用程序需要定义以下方法：

```ts
window.webkit.messageHandlers.externalBus.postMessage(message: string);
```

要将消息发送到前端，请将消息序列化为JSON并从外部应用程序调用以下函数：

```ts
window.externalBus(message: string)
```

## 消息格式

消息描述了发送方希望接收方执行或了解的操作或信息。如果是操作，发送方将期望得到操作结果的响应。对命令的响应可以是成功或失败。

### 操作和信息消息格式

包含或提供信息的消息格式相同。它包含一个标识符、一个类型和一个可选的有效负载（取决于类型）。

响应消息将重用响应中的标识符，以指示响应与哪个操作相关联。

消息的基本格式如下：

```ts
{
  id: number;
  type: string;
  payload?: unknown;
}
```

示例消息：

```json
{
  "id": 5,
  "type": "config/get"
}
```

### 结果消息格式

如果消息是一个操作，发送方将期望得到一个结果响应。响应可以是成功或失败。

结果的类型取决于它所回应的消息的类型。例如，如果它回应`config/get`，结果应该是描述配置的对象。

消息格式：

```ts
interface SuccessResult {
  id: number;
  type: "result";
  success: true;
  result: unknown;
}

interface ErrorResult {
  id: number;
  type: "result";
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

## 支持的消息

### 获取外部配置

可用于：Home Assistant 0.92
类型：`config/get`
方向：前端到外部应用程序。
期望答复：是

查询外部应用程序的外部配置。外部配置用于在前端中定制体验。

预期的响应有效载荷：

```ts
{
  hasSettingsScreen: boolean;
  canWriteTag: boolean;
}
```

- `hasSettingsScreen`设置为true，如果外部应用程序在接收到`config_screen/show`命令时将显示一个配置屏幕。如果是这样，将在侧边栏中添加一个新选项来触发配置屏幕。
- `canWriteTag`设置为true，如果外部应用程序能够写入标签，因此可以支持`tag/write`命令。

### 显示配置屏幕 `config_screen/show`

可用于：Home Assistant 0.92
类型：`config_screen/show`
方向：前端到外部应用程序。
期望答复：否

显示外部应用程序的配置屏幕。

### 连接状态更新 `connection-status`

可用于：Home Assistant 0.92
类型：`connection-status`
方向：前端到外部应用程序。
期望答复：否

如果前端连接到Home Assistant，则通知外部应用程序。

有效载荷结构：

```ts
{
  event: "connected" | "auth-invalid" | "disconnected";
}
```

### 触发触觉反馈 `haptic`

可用于：Home Assistant 0.92
类型：`haptic`
方向：前端到外部应用程序。
期望答复：否

通知外部应用程序触发触觉反馈。

有效载荷结构：

```ts
{
  hapticType:
    | "success"
    | "warning"
    | "failure"
    | "light"
    | "medium"
    | "heavy"
    | "selection";

}
```

### 写入标签 `tag/write`

可用于：Home Assistant 0.115
类型：`tag/write`
方向：前端到外部应用程序。
期望答复：是

告诉外部应用程序打开用于写入标签的界面。名称是用户输入的标签名称。如果未设置名称，则名称为`null`。

```ts
{
  tag: string;
  name: string | null;
}
```

预期响应载荷目前为空对象。我们可能会在以后添加更多：

```ts
{}
```
