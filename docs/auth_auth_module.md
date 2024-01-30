---
title: "Multi-factor Authentication Modules"
---
多因素认证模块与[身份验证提供者](auth_auth_provider.md)一起使用，提供了一个完全可配置的认证框架。每个多因素认证模块可以提供一个多因素认证功能。用户可以启用多个多因素认证模块，但在登录过程中只能选择一个模块。

## 定义多因素认证模块

:::info
目前我们只支持内置的多因素认证模块。将来可能会支持自定义的多因素认证模块。
:::

多因素认证模块在`homeassistant/auth/mfa_modules/<模块名称>.py`中定义。认证模块需要提供`MultiFactorAuthModule`类的实现。

有关完整实现的认证模块示例，请参见[insecure_example.py](https://github.com/home-assistant/core/blob/dev/homeassistant/auth/mfa_modules/insecure_example.py)。

多因素认证模块需要扩展`MultiFactorAuthModule`类的以下方法。

| 方法 | 是否必需 | 描述
| ------ | -------- | -----------
| `@property def input_schema(self)` | 是 | 返回定义用户输入表单的模式。
| `async def async_setup_flow(self, user_id)` | 是 | 返回一个SetupFlow来处理设置工作流程。
| `async def async_setup_user(self, user_id, setup_data)` | 是 | 设置用户以使用此认证模块。
| `async def async_depose_user(self, user_id)` | 是 | 从此认证模块中删除用户信息。
| `async def async_is_user_setup(self, user_id)` | 是 | 返回用户是否已设置。
| `async def async_validate(self, user_id, user_input)` | 是 | 给定用户 ID 和用户输入，返回验证结果。
| `async def async_initialize_login_mfa_step(self, user_id)` | 否 | 在显示登录流程中的多因素认证步骤之前调用。这不是初始化多因素认证模块，而是登录流程中的多因素认证步骤。

## 设置流程

在用户能够使用多因素认证模块之前，必须启用或设置它。所有可用的模块将列在用户配置文件页面中，用户可以启用他/她要使用的模块。设置数据输入流将引导用户完成必要的步骤。

每个多因素认证模块都需要实现一个设置流程处理程序，扩展自`mfa_modules.SetupFlow`（如果只需要一个简单的设置步骤，则也可以使用`SetupFlow`）。例如，对于Google Authenticator（TOTP，基于时间的一次性密码）模块，流程将需要：

- 生成一个密钥并将其存储在设置流程实例中
- 返回带有描述中的二维码的`async_show_form`（通过`description_placeholders`以base64注入）
- 用户扫描代码并输入代码以验证扫描的正确性和时钟同步
- TOTP模块将密钥与用户ID一起保存，模块为用户启用

## Workflow

<img class='invertDark' src='/img/en/auth/mfa_workflow.png'
  alt='Multi Factor Authentication Workflow' />

<!--
Source: https://drive.google.com/file/d/12_nANmOYnOdqM56BND01nPjJmGXe-M9a/view
-->

## Configuration example

```yaml
# configuration.xml
homeassistant:
  auth_providers:
    - type: homeassistant
    - type: legacy_api_password
  auth_mfa_modules:
    - type: totp
    - type: insecure_example
      users: [{'user_id': 'a_32_bytes_length_user_id', 'pin': '123456'}]
```

在这个示例中，用户首先从`homeassistant`或`legacy_api_password`身份验证提供者中进行选择。对于`homeassistant`身份验证提供者，用户将首先输入用户名/密码。如果该用户同时启用了`totp`和`insecure_example`，那么用户需要选择一个身份验证模块，然后根据选择输入Google Authenticator代码或输入PIN代码。

:::tip
`insecure_example`仅用于演示目的，请勿在生产环境中使用。
:::

## 验证会话

与身份验证提供者不同，身份验证模块使用会话来管理验证过程。在身份验证提供者验证成功后，多因素认证模块将创建一个验证会话，包括过期时间和身份验证提供者验证结果中的用户 ID。多因素认证模块将不仅验证用户输入，还将验证会话未过期。验证会话数据存储在配置目录中。