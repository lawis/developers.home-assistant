---
title: Data Entry Flow 数据条目流程

---

数据条目流是Home Assistant的一部分，是一个用于数据输入的框架。数据输入是通过数据输入流进行的。一个流可以表示一个简单的登录表单，也可以表示一个组件的多步设置向导。流管理器管理所有正在进行的流程，并处理新流程的创建。

数据条目流在Home Assistant中用于登录、创建配置条目、处理选项流程和修复问题。

## 流程管理器

流程管理器是管理正在进行的流程的类。在实例化一个流程管理器时，你需要传入两个异步回调函数：

```python
async def async_create_flow(handler, context=context, data=data):
    """Create flow."""
```

流程管理器将配置流处理程序的实例化委托给这个异步回调函数。这允许管理器的父级定义自己的方式来查找处理程序并准备实例化处理程序的过程。例如，在配置条目管理器的情况下，它将确保依赖项和要求已设置好。

```python
async def async_finish_flow(flow, result):
    """Finish flow."""
```

当流程完成或中止时，将调用这个异步回调函数，即`result['type'] in [FlowResultType.CREATE_ENTRY, FlowResultType.ABORT]`。如果结果类型更改为`FlowResultType.FORM`，回调函数可以修改结果并将其返回，流程将继续运行，并显示另一个表单。

如果结果类型为`FlowResultType.FORM`，结果应该如下所示：

```python
{
    # The result type of the flow
    "type": FlowResultType.FORM,
    # the id of the flow
    "flow_id": "abcdfgh1234",
    # handler name
    "handler": "hue",
    # name of the step, flow.async_step_[step_id] will be called when form submitted
    "step_id": "init",
    # a voluptuous schema to build and validate user input
    "data_schema": vol.Schema(),
    # an errors dict, None if no errors
    "errors": errors,
    # a detail information about the step
    "description_placeholders": description_placeholders,
}
```

如果结果类型是`FlowResultType.CREATE_ENTRY`，结果应该如下所示：
```python
{
    # Data schema version of the entry
    "version": 2,
    # The result type of the flow
    "type": FlowResultType.CREATE_ENTRY,
    # the id of the flow
    "flow_id": "abcdfgh1234",
    # handler name
    "handler": "hue",
    # title and data as created by the handler
    "title": "Some title",
    "result": {
        "some": "data"
    },
}
```

如果结果类型是`FlowResultType.ABORT`，结果应该如下所示：
```python
{
    # The result type of the flow
    "type": FlowResultType.ABORT,
    # the id of the flow
    "flow_id": "abcdfgh1234",
    # handler name
    "handler": "hue",
    # the abort reason
    "reason": "already_configured",
}
```

## 流处理程序

流处理程序将处理单个流程。一个流程包含一个或多个步骤。当流程被实例化时，`FlowHandler.init_step` 步骤将被调用。每个步骤都有几种可能的结果：

- [显示表单](#show-form)
- [创建条目](#create-entry)
- [中止](#abort)
- [外部步骤](#external-step--external-step-done)
- [显示进度](#show-progress--show-progress-done)
- [显示菜单](#show-menu)

至少，每个流程处理程序必须定义一个版本号和一个步骤。这不一定是`init`，因为`async_create_flow`可以根据当前的工作流程分配`init_step`，例如在配置中，将使用`context.source`作为`init_step`。

例如，一个最简单的配置流程示例如下：

```python
from homeassistant import data_entry_flow

@config_entries.HANDLERS.register(DOMAIN)
class ExampleConfigFlow(data_entry_flow.FlowHandler):

    # The schema version of the entries that it creates
    # Home Assistant will call your migrate method if the version changes
    # (this is not implemented yet)
    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle user step."""
```


数据录入流程依赖于步骤中显示文本的翻译。这取决于数据录入流程管理器的父级，其中存储了这些翻译。对于配置和选项流程，分别存储在`strings.json`的`config`和`option`下。

有关`strings.json`的更详细解释，请参阅[后端翻译](/docs/internationalization/core)页面。


### 显示表单

该结果类型将向用户显示一个需要填写的表单。您需要定义当前步骤、数据的模式使用 voluptuous 和/或[selectors](https://www.home-assistant.io/docs/blueprint/selectors/)的混合）以及可选的错误字典。

```python
from homeassistant.helpers.selector import selector

class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_user(self, user_input=None):
        # Specify items in the order they are to be displayed in the UI
        data_schema = {
            vol.Required("username"): str,
            vol.Required("password"): str,
        }

        if self.show_advanced_options:
            data_schema["allow_groups"] = selector({
                "select": {
                    "options": ["all", "light", "switch"],
                }
            })

        return self.async_show_form(step_id="init", data_schema=vol.Schema(data_schema))
```
#### 标签和描述

表单的翻译内容以`strings.json`中的`step_id`作为键添加。该对象可以包含以下键：

|        键        |           值            | 说明                                                                                                                                                           |
| :--------------: | :--------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `title`      |     表单标题     | 不要包含您的品牌名称，它将自动从您的清单中注入。                                                                                                               |
|  `description`   |   表单说明    | 可选。不要链接到文档，因为它会自动链接。不要包括"basic"信息，如"Here you can set up X"。                                                                          |
|      `data`      |     字段标签     | 在适当时尽量保持简洁，并与其他集成保持一致，以便获得最佳用户体验。                                                                                               |
| `data_description` |    字段描述     | 可选的解释性文本，显示在字段下方。                                                                                                                            |

字段标签和描述以一个字典的形式给出，其中键对应于您的模式。以下是一个简单的示例：

```json
{
  "config": {
    "step": {
      "user": {
          "title": "Add Group",
          "description": "Some description",
          "data": {
              "entities": "Entities",
          },
          "data_description": {
              "entities": "The entities to add to the group",
          },
      }
    }
  }
}
```

#### 启用浏览器自动填充

假设您的集成正在收集可以由浏览器或密码管理器自动填充的表单数据，例如登录凭据或联系信息。您应该尽可能启用自动填充，以提供最佳的用户体验和可访问性。有两种选项可用于启用此功能。

第一种选项是使用 Voluptuous，使用前端识别的数据键。前端将识别键 `"username"` 和 `"password"`，并分别添加 HTML `autocomplete` 属性值为 `"username"` 和 `"current-password"`。自动填充仅支持 `"username"` 和 `"password"` 字段，并且主要支持将其转换为选择器之前，快速启用自动填充。

第二种选项是使用[text选择器](https://www.home-assistant.io/docs/blueprint/selectors/#text-selector)。文本选择器可完全控制输入类型，并允许指定任何允许的 `autocomplete` 值。收集特定可填充数据的假设架构示例如下：

```python
import voluptuous as vol
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.helpers.selector import (
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_USERNAME): TextSelector(
            TextSelectorConfig(type=TextSelectorType.EMAIL, autocomplete="username")
        ),
        vol.Required(CONF_PASSWORD): TextSelector(
            TextSelectorConfig(
                type=TextSelectorType.PASSWORD, autocomplete="current-password"
            )
        ),
        vol.Required("postal_code"): TextSelector(
            TextSelectorConfig(type=TextSelectorType.TEXT, autocomplete="postal-code")
        ),
        vol.Required("mobile_number"): TextSelector(
            TextSelectorConfig(type=TextSelectorType.TEL, autocomplete="tel")
        ),
    }
)
```

#### 默认值与建议

如果您希望预填写表单数据，您有两个选项。第一个选项是使用`default`参数。这将对字段进行预填充，并在用户未填写字段时充当默认值。

```python
    data_schema = {
        vol.Optional("field_name", default="default value"): str,
    }
```

The other alternative is to use a suggested value - this will also pre-fill the form field, but will allow the user to leave it empty if the user so wishes.

```python
    data_schema = {
        vol.Optional(
            "field_name", description={"suggested_value": "suggested value"}
        ): str,
    }
```

您还可以混合使用-通过`suggested_value`进行预填充，并在字段为空时使用不同的值作为`default`，但这可能会让用户感到困惑，因此请谨慎使用。

使用建议值还可以声明一个静态模式，并从现有输入中合并建议值。一个名为`add_suggested_values_to_schema`的帮助器使这成为可能：

```python
OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Optional("field_name", default="default value"): str,
    }
)

class ExampleOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        return self.async_show_form(
            data_schema = self.add_suggested_values_to_schema(
                OPTIONS_SCHEMA, self.entry.options
            )
        )
```


#### 验证

用户填写完表单后，步骤方法将再次被调用，并将用户输入传入。只有当用户输入符合数据模式时，您的步骤才会被调用。当用户传入数据时，您必须对数据进行额外的验证。例如，您可以验证传入的用户名和密码是否有效。

如果出现错误，您可以返回一个包含错误的字典。错误字典中的每个键都指示包含错误的字段名称。如果要显示与特定字段无关的错误，请使用键`base`。指定的错误需要在翻译文件中引用一个键。


```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            # Validate user input
            valid = await is_valid(user_input)
            if valid:
                # See next section on create entry usage
                return self.async_create_entry(...)

            errors["base"] = "auth_error"

        # Specify items in the order they are to be displayed in the UI
        data_schema = {
            vol.Required("username"): str,
            vol.Required("password"): str,
        }

        return self.async_show_form(
            step_id="init", data_schema=vol.Schema(data_schema), errors=errors
        )
```


#### 多步骤流程

如果用户输入通过了验证，您可以再次返回可能的步骤类型之一。如果您想将用户导航到下一步，请返回该步骤的返回值：

```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_init(self, user_input=None):
        errors = {}
        if user_input is not None:
            # Validate user input
            valid = await is_valid(user_input)
            if valid:
                # Store info to use in next step
                self.init_info = user_input
                # Return the form of the next step
                return await self.async_step_account()

        ...
```


### 创建条目

当结果为"Create Entry"时，将创建一个条目并传递给流程管理器的父级。用户将看到一个成功的消息，并且流程结束。您可以通过传递标题和数据来创建一个条目。标题可以在用户界面中用于指示条目的名称。数据可以是任何数据类型，只要它可以被JSON序列化。

```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_user(self, user_input=None):
        return self.async_create_entry(
            title="Title of the entry",
            data={
                "something_special": user_input["username"]
            },
        )
```


### 中止

当无法完成流程时，您需要中止它。这将结束流程并通知用户流程已完成。无法完成流程的原因可能是设备已经配置或不兼容 Home Assistant。

```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_user(self, user_input=None):
        return self.async_abort(reason="not_supported")
```
### 外部步骤和外部步骤完成

有时用户可能需要通过在外部网站上执行操作来完成配置流程。例如，通过重定向到外部网页来设置集成。这通常由使用OAuth2授权用户的集成使用。

_该示例是关于配置条目的，但也适用于使用数据输入流程的其他部分。_

该流程的工作方式如下：

1. 用户在 Home Assistant 中启动配置流程。
2. 配置流程提示用户在外部网站上完成流程。
3. 用户打开外部网站。
4. 在完成外部步骤后，用户的浏览器将被重定向到 Home Assistant 的一个端点以传递响应。
5. 端点对响应进行验证，并在验证通过后将外部步骤标记为已完成，并返回关闭窗口的 JavaScript 代码：`<script>window.close()</script>`。

    为了能够将外部步骤的结果路由到 Home Assistant 的端点上，您需要确保配置流程ID被包括在内。如果您的外部步骤是OAuth2流程，您可以利用oauth2的状态变量。这是一个在授权页面上不被解析，而是原样传递给Home Assistant端点的变量。

6. 窗口关闭，Home Assistant 用户界面中的配置流程将再次对用户可见。
7. 当外部步骤被标记为已完成时，配置流程会自动前进到下一步。用户将被提示进行下一步操作。

以下是包含外部步骤的示例配置流程。

```python
from homeassistant import config_entries

@config_entries.HANDLERS.register(DOMAIN)
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    VERSION = 1
    data = None

    async def async_step_user(self, user_input=None):
        if not user_input:
            return self.async_external_step(
                step_id="user",
                url=f"https://example.com/?config_flow_id={self.flow_id}",
            )

        self.data = user_input
        return self.async_external_step_done(next_step_id="finish")

    async def async_step_finish(self, user_input=None):
        return self.async_create_entry(title=self.data["title"], data=self.data)
```

在返回`async_mark_external_step_done`之前，避免根据外部步骤的数据进行任何工作。相反，将工作放在您在标记外部步骤为完成时所指的`next_step_id`步骤中。这将为用户提供更好的用户体验，因为在进行工作时，界面将显示一个加载动画。

如果在授权回调函数中进行工作，用户将会一直盯着一个空白屏幕，直到突然关闭，因为数据已经转发。如果在标记外部步骤为完成之前进行工作，用户仍将看到带有“打开外部网站”按钮的表单，同时后台工作正在进行。这也是不可取的。

以下是将外部步骤标记为已完成的示例代码：

```python
from homeassistant import data_entry_flow


async def handle_result(hass, flow_id, data):
    result = await hass.config_entries.async_configure(flow_id, data)

    if result["type"] == data_entry_flow.FlowResultType.EXTERNAL_STEP_DONE:
        return "success!"
    else:
        return "Invalid config flow specified"
```

### 显示进度 & 显示进度完成

有时候我们需要用户等待一项需要几分钟的任务。

_该示例是关于配置条目的，但也适用于使用数据输入流程的其他部分。_

该流程的工作方式如下：

1. 用户在 Home Assistant 中启动配置流程。
2. 配置流程通过调用`async_show_progress`来提示用户任务正在进行中，并需要一些时间来完成。流程应将任务特定的字符串作为`progress_action`参数传递，以表示提示的翻译文本。
3. 流程负责管理后台任务，并在任务完成或取消时继续流程。通过调用`FlowManager.async_configure`方法（例如通过`hass.config_entries.flow.async_configure`）来继续流程。创建一个新的任务来执行此操作，以避免死锁。
4. 任务完成后，流程应使用`async_show_progress_done`方法标记进度已完成。
5. 前端每次调用show progress或show progress done时都会更新。
6. 当进度被标记为完成时，配置流程将自动前进到下一步。用户将被提示进行下一步操作。

以下是包含两个显示进度任务的示例配置流程。

```python
from homeassistant import config_entries
from .const import DOMAIN

class TestFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1
    task_one = None
    task_two = None

    async def _async_do_task(self, task):
        await task  # A task that take some time to complete.

        # Continue the flow after show progress when the task is done.
        # To avoid a potential deadlock we create a new task that continues the flow.
        # The task must be completely done so the flow can await the task
        # if needed and get the task result.
        self.hass.async_create_task(
            self.hass.config_entries.flow.async_configure(flow_id=self.flow_id)
        )

    async def async_step_user(self, user_input=None):
        if not self.task_one or not self.task_two:
            if not self.task_one:
                task = asyncio.sleep(10)
                self.task_one = self.hass.async_create_task(self._async_do_task(task))
                progress_action = "task_one"
            else:
                task = asyncio.sleep(10)
                self.task_two = self.hass.async_create_task(self._async_do_task(task))
                progress_action = "task_two"
            return self.async_show_progress(
                step_id="user",
                progress_action=progress_action,
            )

        return self.async_show_progress_done(next_step_id="finish")

    async def async_step_finish(self, user_input=None):
        if not user_input:
            return self.async_show_form(step_id="finish")
        return self.async_create_entry(title="Some title", data={})
```


注意：如果用户关闭了流程，`async_remove`回调将被调用。请确保在FlowHandler中实现此方法，以清理与流程相关的任何资源或任务。
```python
class TestFlow(config_entries.ConfigFlow, domain=DOMAIN):
    ...

    @callback
    def async_remove(self):
        """Clean up resources or tasks associated with the flow."""
        if self.task_one:
            self.task_one.cancel()
            
        if self.task_two:
            self.task_two.cancel()
        ...
```

### 显示菜单

这将向用户显示一个导航菜单，以便轻松选择下一步操作。菜单标签可以通过指定一个{`step_id`: `label`}的字典进行硬编码，或者通过在指定列表时通过`strings.json`进行翻译。

```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_user(self, user_input=None):
        return self.async_show_menu(
            step_id="user",
            menu_options=["discovery", "manual"],
            description_placeholders={
                "model": "Example model",
            }
        )
        # Example showing the other approach
        return self.async_show_menu(
            step_id="user",
            menu_options={
                "option_1": "Option 1",
                "option_2": "Option 2",
            }
        )
```

```json
{
  "config": {
    "step": {
      "user": {
        "menu_options": {
          "discovery": "Discovery",
          "manual": "Manual ({model})",
        }
      }
    }
  }
}
```


## 从外部来源初始化配置流程

您可能希望以编程的方式初始化配置流程。例如，如果我们在网络上发现一个需要用户交互才能完成设置的设备。要实现这一点，在初始化流程时传递一个源参数和可选的用户输入：

```python
await flow_mgr.async_init(
    "hue", context={"source": data_entry_flow.SOURCE_DISCOVERY}, data=discovery_info
)
```


配置流程处理程序不会从`init`步骤开始。相反，它将使用与源名称相同的步骤进行实例化。该步骤应该遵循与普通步骤相同的返回值。
```python
class ExampleConfigFlow(data_entry_flow.FlowHandler):
    async def async_step_discovery(self, info):
        """Handle discovery info."""
```

在`FlowHandler`上，配置流程的源可以通过`self.source`进行访问。
