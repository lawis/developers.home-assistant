---
title: "Push Notifications 推送通知"
---


`mobile_app` 集成中内置了一个通知平台，可以以通用的方式向用户发送推送通知，而无需安装外部自定义组件。推送通知可以通过 WebSocket 连接或云服务进行传递。

## 启用 WebSocket 推送通知

您的应用程序可以通过 WebSocket API 连接到 Home Assistant，以订阅推送通知。要启用此功能，您的应用程序需要订阅云推送通知或在注册中的 `app_data` 对象中添加 `push_websocket_channel: true`。

要创建 WebSocket 通道，请创建一个推送通知订阅：

```json
{
  "id": 2,
  "type": "mobile_app/push_notification_channel",
  "webhook_id": "abcdefghkj",
  "support_confirm": true // optional
}
```

所有的推送通知都将通过 WebSocket 连接作为一个事件进行传递：
```json
{
  "id": 2,
  "type": "event",
  "event": {
    "message": "Hello world",
    "hass_confirm_id": "12345" // if confirm = true
  },
}
```

如果启用了确认功能，您需要发送一个 WebSocket 命令来进行确认：
```json
{
  "id": 3,
  "type": "mobile_app/push_notification_confirm",
  "webhook_id": "abcdefghkj",
  "confirm_id": "12345"
}
```


如果注册支持云推送通知，并且已连接以接收本地推送通知，则通知将首先在本地传递，如果应用程序不确认通知，则回退到云端。

## 启用云推送通知

要为您的应用程序启用通知平台，您必须在初始注册或更新现有注册时，在 `app_data` 对象中设置两个键。

| 键 | 类型 | 描述
| --- | ---- | -----------
| `push_token` | 字符串 | 与用户设备唯一相关的推送通知令牌。例如，这可以是一个APNS令牌或一个FCM实例ID/令牌。
| `push_url` | 字符串 | 您的服务器上将进行HTTP POST的推送通知的URL。

您应该建议用户在设置完这些密钥后重新启动 Home Assistant，以便他们能够看到通知目标。其格式为 `notify.mobile_app_<saved_device_name>`。

### 部署服务器组件

通知平台无需考虑如何通知您的用户。它只是将通知转发到您的外部服务器，在那里您应该实际处理请求。
这种方法使您能够完全控制推送通知基础设施。

请参阅此文档的下一节，了解使用 Firebase Cloud Functions 和 Firebase Cloud Messaging 实现推送通知转发的示例服务器组件。

您的服务器应该接受类似于以下的 HTTP POST 负载：


```json
{
  "message": "Hello World",
  "title": "Test message sent via mobile_app.notify",
  "push_token": "my-secure-token",
  "registration_info": {
    "app_id": "io.home-assistant.iOS",
    "app_version": "1.0.0",
    "os_version": "12.2",
    "webhook_id": "webhook_id_from_registration"
  },
  "data": {
    "key": "value"
  }
}
```
:::info
`webhook_id` 仅从 core-2021.11 版本或更高版本开始包含。
:::

假设通知成功排队等待发送，服务器应该以 201 状态代码作为响应。

### 错误

如果发生错误，您应返回错误描述，并使用 201 或 429 以外的状态代码。错误响应必须是一个 JSON 对象，可以包含以下键之一：

| 键 | 类型 | 描述
| --- | ---- | -----------
| `errorMessage` | 字符串 | 如果提供了，它将追加到预设错误消息中。例如，如果 `errorMessage` 是 "无法与 Apple 通信"，则在日志中输出为 "内部服务器错误，请稍后重试：无法与 Apple 通信"
| `message` | 字符串 | 如果提供了，它将直接以警告日志级别输出到日志中。

无论使用哪个键，您都应尽量详细地描述出现了什么问题，如果可能，以及用户该如何解决。

### 速率限制

通知平台还支持向用户公开速率限制。Home Assistant 建议您实现保守的速率限制，以降低成本，也好让用户不会因为太多通知而过载。
供参考，Home Assistant Companion 在 24 小时内最多可发送 150 条通知。速率限制在每天协调世界时午夜重置。当然，您可以根据自己的需要使用任何配置来实现速率限制。

如果您选择实现速率限制，您的成功服务器响应应如下所示：

```json
{
  "rateLimits": {
    "successful": 1,
    "errors": 5,
    "maximum": 150,
    "resetsAt": "2019-04-08T00:00:00.000Z"
  }
}
```

| 键 | 类型 | 描述
| --- | ---- | -----------
| `successful` | 整数 | 用户在速率限制期间成功发送的推送通知数量。
| `errors` | 整数 | 用户在速率限制期间发送失败的推送通知数量。
| `maximum` | 整数 | 用户在速率限制期间可以发送的最大推送通知数量。
| `resetsAt` | ISO8601 时间戳 | 用户的速率限制期到期的时间戳。必须以 UTC 时区提供。

每次成功发送通知后，速率限制将以警告日志级别的形式输出到日志中。Home Assistant 还会输出距速率限制期重置的精确剩余时间。

一旦用户在速率限制期间发送的通知数量达到最大限制，您应开始使用 429 状态码作为响应，直到速率限制期到期。响应对象可以选择包含一个名为 `message` 的键，该键将被输出到 Home Assistant 日志中，而不是标准错误消息。

通知平台本身不实现任何类型的速率限制保护。用户将能够继续向您发送通知，因此应在您的逻辑中尽早使用 429 状态码拒绝它们。

### 示例服务器实现

下面的代码是一个将通知转发到 Firebase Cloud Messaging 的 Firebase Cloud Function 示例。要部署此代码，您应创建一个名为 `rateLimits` 的新 Firestore 数据库。然后，您可以部署以下代码。
此外，请确保已正确配置您的项目，并使用适用于 APNS 和 FCM 的正确认证密钥。


```javascript
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

var db = admin.firestore();

const MAX_NOTIFICATIONS_PER_DAY = 150;

exports.sendPushNotification = functions.https.onRequest(async (req, res) => {
  console.log('Received payload', req.body);
  var today = getToday();
  var token = req.body.push_token;
  var ref = db.collection('rateLimits').doc(today).collection('tokens').doc(token);

  var payload = {
    notification: {
      body: req.body.message,
    },
    token: token,
  };

  if(req.body.title) {
    payload.notification.title = req.body.title;
  }

  if(req.body.data) {
    if(req.body.data.android) {
      payload.android = req.body.data.android;
    }
    if(req.body.data.apns) {
      payload.apns = req.body.data.apns;
    }
    if(req.body.data.data) {
      payload.data = req.body.data.data;
    }
    if(req.body.data.webpush) {
      payload.webpush = req.body.data.webpush;
    }
  }

  console.log('Notification payload', JSON.stringify(payload));

  var docExists = false;
  var docData = {
    deliveredCount: 0,
    errorCount: 0,
    totalCount: 0,
  };

  try {
    let currentDoc = await ref.get();
    docExists = currentDoc.exists;
    if(currentDoc.exists) {
      docData = currentDoc.data();
    }
  } catch(err) {
    console.error('Error getting document!', err);
    return handleError(res, 'getDoc', err);
  }

  if(docData.deliveredCount > MAX_NOTIFICATIONS_PER_DAY) {
    return res.status(429).send({
      errorType: 'RateLimited',
      message: 'The given target has reached the maximum number of notifications allowed per day. Please try again later.',
      target: token,
      rateLimits: getRateLimitsObject(docData),
    });
  }

  docData.totalCount = docData.totalCount + 1;

  var messageId;
  try {
    messageId = await admin.messaging().send(payload);
    docData.deliveredCount = docData.deliveredCount + 1;
  } catch(err) {
    docData.errorCount = docData.errorCount + 1;
    await setRateLimitDoc(ref, docExists, docData, res);
    return handleError(res, 'sendNotification', err);
  }

  console.log('Successfully sent message:', messageId);

  await setRateLimitDoc(ref, docExists, docData, res);

  return res.status(201).send({
    messageId: messageId,
    sentPayload: payload,
    target: token,
    rateLimits: getRateLimitsObject(docData),
  });

});

async function setRateLimitDoc(ref, docExists, docData, res) {
  try {
    if(docExists) {
      console.log('Updating existing doc!');
      await ref.update(docData);
    } else {
      console.log('Creating new doc!');
      await ref.set(docData);
    }
  } catch(err) {
    if(docExists) {
      console.error('Error updating document!', err);
    } else {
      console.error('Error creating document!', err);
    }
    return handleError(res, 'setDocument', err);
  }
  return true;
}

function handleError(res, step, incomingError) {
  if (!incomingError) return null;
  console.error('InternalError during', step, incomingError);
  return res.status(500).send({
    errorType: 'InternalError',
    errorStep: step,
    message: incomingError.message,
  });
}

function getToday() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  return yyyy + mm + dd;
}

function getRateLimitsObject(doc) {
  var d = new Date();
  return {
    successful: (doc.deliveredCount || 0),
    errors: (doc.errorCount || 0),
    total: (doc.totalCount || 0),
    maximum: MAX_NOTIFICATIONS_PER_DAY,
    remaining: (MAX_NOTIFICATIONS_PER_DAY - doc.deliveredCount),
    resetsAt: new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)
  };
}
```
