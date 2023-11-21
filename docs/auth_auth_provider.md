---
title: "Authentication Providers 身份验证提供者"
---

认证提供者用于确认用户的身份。用户通过进行身份验证提供者的登录流程来证明其身份。身份验证提供者定义了登录流程，并可以要求用户提供所需的所有信息。这通常包括用户名和密码，但也可能包括2FA令牌或其他验证方式。

一旦身份验证提供者确认了用户的身份，它将通过Credentials对象将其传递给Home Assistant。

## 定义身份验证提供者

:::info
目前我们只支持内置的身份验证提供者。未来可能会支持自定义身份验证提供者。
:::

身份验证提供者在`homeassistant/auth/providers/<身份验证提供者名称>.py`中定义。身份验证提供者模块需要提供`AuthProvider`类和`LoginFlow`类的实现，它会根据`data_entry_flow`要求用户提供信息并进行验证。

有关完整实现的身份验证提供者示例，请参见[insecure_example.py](https://github.com/home-assistant/core/blob/dev/homeassistant/auth/providers/insecure_example.py)。

身份验证提供者应扩展`AuthProvider`类的以下方法。

| 方法 | 是否必需 | 描述
| ------ | -------- | -----------
| async def async_login_flow(self) | 是 | 返回一个用户用于识别自己的登录流程实例。
| async def async_get_or_create_credentials(self, flow_result) | 是 | 根据登录流程的结果返回一个凭据对象。这可以是现有的对象也可以是新的对象。
| async def async_user_meta_for_credentials(credentials) | 否 | 在Home Assistant将从凭据对象创建用户之前回调调用。可用于为用户填充额外字段。

身份验证提供者应扩展`LoginFlow`类的以下方法。

| 方法 | 是否必需 | 描述
| ------ | -------- | -----------
| async def async_step_init(self, user_input=None) | 是 | 处理登录表单，详情请参见下文。

## LoginFlow 的 async_step_init 方法

:::info
我们可能在不久的将来更改此接口。
:::

`LoginFlow`继承了`data_entry_flow.FlowHandler`。数据输入流的第一步硬编码为`init`，因此每个流必须实现`async_step_init`方法。`async_step_init`方法的模式如下伪代码所示：

```python
async def async_step_init(self, user_input=None):
    if user_input is None:
        return self.async_show_form(
            step_id="init", data_schema="some schema to construct ui form"
        )
    if is_invalid(user_input):
        return self.async_show_form(step_id="init", errors=errors)
    return await self.async_finish(user_input)
```
