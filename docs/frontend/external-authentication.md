---
title: "External Authentication 外部认证"
---

默认情况下，前端将自行处理身份验证令牌。如果未找到身份验证令牌，它将重定向用户到登录页面，并负责更新令牌。

如果您想在外部应用程序中嵌入Home Assistant前端，您将希望将身份验证存储在应用程序内部，但使其对前端可用。为了支持这一点，Home Assistant提供了一个外部身份验证API。

要激活此API，请在URL后附加`?external_auth=1`加载前端。如果传递了这个参数，Home Assistant将期望`window.externalApp`（对于Android）或`window.webkit.messageHandlers`（对于iOS）被定义，其中包含以下所述的方法。

## 获取访问令牌

_此API在Home Assistant 0.78版本中引入。_

当前端加载时，它将从外部身份验证请求访问令牌。它通过使用options对象调用以下方法之一来实现。options对象定义了用于调用响应的回调方法，以及一个可选的`force`布尔值，如果 access token 应刷新，则设置为`true`，无论它是否已过期。

`force`布尔值在Home Assistant 0.104版本中引入，可能不总是可用。

```js
window.externalApp.getExternalAuth({
  callback: "externalAuthSetToken",
  force: true
});
// or
window.webkit.messageHandlers.getExternalAuth.postMessage({
  callback: "externalAuthSetToken",
  force: true
});
```

响应应包含一个布尔值，表示是否成功以及一个包含访问令牌和其有效剩余时间的对象。将响应传递给在options对象中定义的函数。

```js
// To be called by external app
window.externalAuthSetToken(true, {
  access_token: "qwere",
  expires_in: 1800
});

// If unable to get new access token
window.externalAuthSetToken(false);
```

当页面首次加载时，前端将调用此方法，并在需要有效令牌但先前接收到的令牌已过期时调用此方法。

## 撤销令牌

_此API在Home Assistant 0.78版本中引入。_

当用户在个人资料页面上按下注销按钮时，外部应用程序将需要[撤销刷新令牌](auth_api.md#revoking-a-refresh-token)，并注销用户。

```js
window.externalApp.revokeExternalAuth({
  callback: "externalAuthRevokeToken"
});
// or
window.webkit.messageHandlers.revokeExternalAuth.postMessage({
  callback: "externalAuthRevokeToken"
});
```

完成后，外部应用程序必须调用在options对象中定义的函数。
```js
// To be called by external app
window.externalAuthRevokeToken(true);

// If unable to logout
window.externalAuthRevokeToken(false);
```
