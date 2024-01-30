---
title: "Authenticated Webview"
---

Your application already asked the user to authenticate. This means that your app should not ask the user to authenticate again when they open the Home Assistant UI.

To make this possible, the Home Assistant UI supports [external authentication](frontend/external-authentication.md). This allows your app to provide hooks so that the frontend will ask your app for access tokens.

Home Assistant also supports further integration between frontend and app via an [external bus](frontend/external-bus.md).

Note that this feature requires a direct connection to the instance.

您的应用程序已经要求用户进行身份验证。这意味着当用户打开 Home Assistant UI 时，您的应用程序不应再次要求用户进行身份验证。

为了实现这一点，Home Assistant UI 支持[外部身份验证](frontend/external-authentication.md)。这使得您的应用程序可以提供钩子，以便前端向您的应用程序请求访问令牌。

Home Assistant 还支持通过[外部总线](frontend/external-bus.md)在前端和应用程序之间进行进一步的集成。

请注意，该功能需要与实例的直接连接。