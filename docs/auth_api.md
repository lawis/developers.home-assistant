---
title: "Authentication API"
sidebar_label: API
---

这个章节将描述您的应用程序授权并与 Home Assistant 实例集成所需的步骤。[查看演示](https://hass-auth-demo.glitch.me) 使用我们的辅助库 [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket) 提供支持。

每个用户都有自己的 Home Assistant 实例，这使得每个用户都能对自己的数据进行控制。然而，我们也希望让第三方开发者能够轻松创建应用程序，让用户能够与 Home Assistant 进行集成。为了实现这一目标，我们采用了 [OAuth 2规范][oauth2-spec] 结合生成客户端的 [OAuth 2 IndieAuth 扩展][indieauth-spec]。


## 客户端

在您要求用户使用您的应用程序授权其实例之前，您需要一个客户端。在传统的 OAuth2 中，服务器需要在用户授权之前生成一个客户端。然而，由于每个服务器都属于一个用户，我们采用了与 [IndieAuth][indieauth-clients] 稍有不同的方法。

您需要使用的客户端 ID 是您的应用程序的网站。重定向 URL 必须与客户端 ID 的主机和端口相同。例如：

- 客户端 ID：`https://www.my-application.io`
- 重定向 URI：`https://www.my-application.io/hass/auth_callback`

如果您需要不同的重定向 URL（例如，构建原生应用程序），您可以向您的应用程序网站（客户端ID）的内容中添加一个 HTML 标记，并添加一个已批准的重定向 URL。例如，将以下内容添加到您的网站以允许重定向URI `hass://auth`：

```html
<link rel='redirect_uri' href='hass://auth'>
```

Home Assistant会扫描网站的前10kB内容以寻找链接标签。
## Authorize

<a href='https://www.websequencediagrams.com/?lz=dGl0bGUgQXV0aG9yaXphdGlvbiBGbG93CgpVc2VyIC0-IENsaWVudDogTG9nIGludG8gSG9tZSBBc3Npc3RhbnQKABoGIC0-IFVzZXI6AEMJZSB1cmwgAD4JACgOOiBHbyB0bwAeBWFuZCBhAC0ICgBQDgB1DACBFw5jb2RlAHELAE4RZXQgdG9rZW5zIGZvcgAoBgBBGlQAJQUK&s=qsd'>
<img class='invertDark' src='/img/en/auth/authorize_flow.png' alt='Overview of how the different parts interact' />
</a>

:::info
这里的示例URL都显示了额外的空格和换行，仅用于显示目的。
:::

授权 URL 应该包含 `client_id` 和 `redirect_uri` 作为查询参数。

```txt
http://your-instance.com/auth/authorize?
    client_id=https%3A%2F%2Fhass-auth-demo.glitch.me&
    redirect_uri=https%3A%2F%2Fhass-auth-demo.glitch.me%2F%3Fauth_callback%3D1
```


可以选择性地包含一个 `state` 参数，它将被添加到重定向的 URI 中。State 参数非常适合存储您正在验证的实例 URL。例如：

```txt
http://your-instance.com/auth/authorize?
    client_id=https%3A%2F%2Fhass-auth-demo.glitch.me&
    redirect_uri=https%3A%2F%2Fhass-auth-demo.glitch.me%2Fauth_callback&
    state=http%3A%2F%2Fhassio.local%3A8123
```

用户将转到此链接，并被提示登录并授权您的应用程序。授权后，用户将被重定向回传递的重定向 URI，其中授权代码和 state 作为查询参数的一部分。例如：

```txt
https://hass-auth-demo.glitch.me/auth_callback
    code=12345&
    state=http%3A%2F%2Fhassio.local%3A8123
```


此授权代码可以通过将其发送到令牌端点（请参见下一节）来交换令牌。

## Token

令牌端点根据有效的授权授予返回令牌。这个授权可以是从授权端点检索到的授权代码，也可以是刷新令牌。对于刷新令牌，令牌端点还可以撤销令牌。

与此端点的所有交互都需要通过HTTP POST请求发送到`http://your-instance.com/auth/token`，并且请求正文需要编码为`application/x-www-form-urlencoded`格式。

### Authorization code

:::tip

所有请求令牌端点的请求都需要包含与将用户重定向到授权端点时使用的相同的客户端ID完全相同的客户端ID。
:::

Use the grant type `authorization_code` to retrieve the tokens after a user has successfully finished the authorize step. The request body is:

```txt
grant_type=authorization_code&
code=12345&
client_id=https%3A%2F%2Fhass-auth-demo.glitch.me
```

The return response will be an access and refresh token:

```json
{
    "access_token": "ABCDEFGH",
    "expires_in": 1800,
    "refresh_token": "IJKLMNOPQRST",
    "token_type": "Bearer"
}
```

访问令牌是一个短期有效的令牌，可用于访问API。刷新令牌用于获取新的访问令牌。`expires_in` 值表示访问令牌的有效秒数。

如果发出无效的请求，将返回HTTP状态码400。如果为非活动用户请求令牌，则HTTP状态码将为403。

```json
{
    "error": "invalid_request",
    "error_description": "Invalid client id",
}
```

### Refresh token


一旦您通过授权类型 `authorization_code` 获取了刷新令牌，您可以使用它来获取新的访问令牌。请求正文如下

```txt
grant_type=refresh_token&
refresh_token=IJKLMNOPQRST&
client_id=https%3A%2F%2Fhass-auth-demo.glitch.me
```

The return response will be an access token:

```json
{
    "access_token": "ABCDEFGH",
    "expires_in": 1800,
    "token_type": "Bearer"
}
```

An HTTP status code of 400 will be returned if an invalid request has been issued.

```json
{
    "error": "invalid_request",
    "error_description": "Invalid client id",
}
```

### Revoking a refresh token

:::tip
`client_id` is not required to revoke a refresh token
:::

令牌端点还可以撤销刷新令牌。撤销刷新令牌将立即撤销刷新令牌和它所授予的所有访问令牌。要撤销刷新令牌，请进行以下请求：

```txt
token=IJKLMNOPQRST&
action=revoke
```

该请求始终会响应HTTP状态为 200 的空正文，无论请求是否成功。

## 长期有效的访问令牌

长期有效的访问令牌有效期为10年。这对于与第三方API和Webhook风格的集成非常有用。可以在用户的Home Assistant配置文件页面底部的"长期有效的访问令牌"部分创建长期有效的访问令牌。

您还可以使用websocket命令`auth/long_lived_access_token`生成长期有效的访问令牌，以为当前用户创建一个长期有效的访问令牌。访问令牌字符串不保存在Home Assistant中，您必须将其记录在安全的位置。

```json
{
    "id": 11,
    "type": "auth/long_lived_access_token",
    "client_name": "GPS Logger",
    "client_icon": null,
    "lifespan": 365
}
```

The response includes a long-lived access token:

```json
{
    "id": 11,
    "type": "result",
    "success": true,
    "result": "ABCDEFGH"
}
```

## 进行身份验证的请求

一旦您拥有访问令牌，就可以对Home Assistant的API进行身份验证请求。

对于websocket连接，请在[身份验证消息](/api/websocket.md#authentication-phase)中传递访问令牌。

对于HTTP请求，请将令牌类型和访问令牌作为授权头传递：

```http
Authorization: Bearer ABCDEFGH
```

### Example: cURL

```shell
curl -X GET \
  https://your.awesome.home/api/error/all \
  -H 'Authorization: Bearer ABCDEFGH'
```

### Example: Python

```python
import requests

url = "https://your.awesome.home/api/error/all"
headers = {
    "Authorization": "Bearer ABCDEFGH",
}
response = requests.request("GET", url, headers=headers)

print(response.text)
```

### Example: NodeJS

```javascript
fetch('https://your.awesome.home/api/error/all', {
  headers: { Authorization: 'Bearer ABCDEFGH' }
}).then(function (response) {
  if (!response.ok) {
    return Promise.reject(response);
  }
  return response.text();
}).then(function (body ) {
  console.log(body);
});
```


如果访问令牌不再有效，您将收到一个HTTP状态码为401的未授权响应。这意味着您需要刷新令牌。如果刷新令牌不起作用，则令牌不再有效，因此用户不再登录。您应该清除用户的数据，并要求用户重新授权。

[oauth2-spec]: https://tools.ietf.org/html/rfc6749
[indieauth-spec]: https://indieauth.spec.indieweb.org/
[indieauth-clients]: https://indieauth.spec.indieweb.org/#client-identifier

## 签名路径

有时您希望用户向Home Assistant发出GET请求以下载数据。在这种情况下，正常的身份验证系统无法使用，因为我们无法将用户与带有附加的身份验证头的API链接起来。在这种情况下，签名路径可以帮助您。

签名路径是我们服务器上的普通路径，例如`/api/states`，但附带了安全的身份验证签名。用户可以访问此路径，并将作为创建签名路径的访问令牌进行授权。签名路径可以通过 websocket 连接创建，其寿命较短。默认的过期时间为30秒。

有两种方法可以获得签名路径。

如果您正在创建一个集成，可以从`homeassistant.components.http.auth`中导入`async_sign_path`。如果从HTTP请求或WebSocket连接的上下文内调用方法，它将自动采用刷新令牌。如果两者都不可用（例如，因为在自动化中），它将使用特殊的"Home Assistant Content"用户。

如果您正在使用前端工作，可以使用以下WebSocket命令创建一个签名路径：

```js
{
  "type": "auth/sign_path",
  "path": "/api/states",
  // optional, expiration time in seconds. Defaults to 30 seconds
  "expires": 20
}
```

The response will contain the signed path:

```js
{
  "path": "/api/states?authSig=ABCDEFGH"
}
```

关于签名路径需要注意以下几点：

- 如果刷新令牌被删除，签名URL将不再有效。
- 如果用户被删除，签名URL将不再有效（因为刷新令牌将被删除）。
- 如果Home Assistant重新启动，签名URL将不再有效。
- 访问权限仅在接收到请求时验证。如果响应时间超过了过期时间（例如，下载一个大文件），则下载将在过期日期之后继续进行。