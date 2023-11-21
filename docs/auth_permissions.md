---
title: "Permissions 权限"
---

:::info
这是一个实验性的功能，目前还未启用或强制执行。
:::

权限限制了用户可以访问或控制的事物。权限是附加到组的，用户可以成为组的成员。用户是组的成员，他们所属组的权限的组合决定了用户能够看到或控制什么。

权限不适用于被标记为"所有者"的用户。这个用户将始终对所有东西都具有访问权限。

## 总体权限结构

策略是字典，在根级别由不同类别的权限组成。在当前实现中，这仅限于实体类别。

```python
{
    "entities": {
        # …
    }
}
```

Each category can further split into subcategories that describe parts of that category.

```python
{
    "entities": {
        "domains": {
            # …
        },
        "entity_ids": {
            # …
        },
    }
}
```

如果省略了某个类别，用户将不具有该类别的权限。

在定义策略时，任何位置的字典值都可以被替换为`True`或`None`。`True`表示授予权限，`None`表示使用默认值，即拒绝访问。

## 实体

可以使用子类别`entity_ids`、`device_ids`、`area_ids`和`domains`在实体和域的基础上设置实体权限。您可以通过将值设置为`True`来授予对所有实体的访问权限，或者可以使用"read"、"control"和"edit"权限来单独指定每个实体。

系统将返回第一个匹配的结果，根据顺序为：`entity_ids`、`device_ids`、`area_ids`、`domains`、`all`。


```json
{
  "entities": {
    "domains": {
      "switch": true
    },
    "entity_ids": {
      "light.kitchen": {
        "read": true,
        "control": true
      }
    }
  }
}
```

## 合并策略

如果用户是多个组的成员，组的权限策略将在运行时合并为一个单独的策略。在合并策略时，我们将查看字典的每个级别，并使用以下方法比较每个源的值：

1. 如果任何一个值为`True`，合并后的值将变为`True`。
2. 如果任何一个值为字典，合并后的值将成为递归使用此方法检查每个值的字典。
3. 如果所有的值都为`None`，合并后的值将变为`None`。

让我们来看一个例子：

```python
{
    "entities": {
        "entity_ids": {
            "light.kitchen": True
        }
    }
}
```

```python
{
    "entities": {
        "entity_ids": True
    }
}
```

Once merged becomes

```python
{
    "entities": {
        "entity_ids": True
    }
}
```

## 检查权限

目前我们有两种不同的权限检查：用户是否可以对实体进行读取/控制/编辑操作，以及用户是否是管理员，因此允许更改此配置设置。

某些 API 将始终对所有用户可访问，但可能会根据权限提供有限的范围，比如渲染模板。

### 检查权限

要检查权限，您需要访问用户对象。一旦您获取了用户对象，检查权限就很容易了。

```python
from homeassistant.exceptions import Unauthorized
from homeassistant.permissions.const import POLICY_READ, POLICY_CONTROL, POLICY_EDIT

# Raise error if user is not an admin
if not user.is_admin:
    raise Unauthorized()


# Raise error if user does not have access to control an entity
# Available policies: POLICY_READ, POLICY_CONTROL, POLICY_EDIT
if not user.permissions.check_entity(entity_id, POLICY_CONTROL):
    raise Unauthorized()
```

### 上下文对象

在 Home Assistant 中，所有服务调用、触发事件和状态都具有上下文对象。这个对象允许我们将更改归因于事件和服务。这些上下文对象还包含了一个用户ID，用于检查权限。

对于权限检查来说，重要的是代表用户执行的操作要使用包含用户ID的上下文来完成。如果您在服务处理程序中，应该重新使用传入的上下文`call.context`。如果您在 WebSocket API 或 Rest API 端点中，应该创建一个具有正确用户的上下文：

```python
from homeassistant.core import Context

await hass.services.async_call(
    "homeassistant", "stop", context=Context(user_id=user.id), blocking=True
)
```
### 如果权限检查失败

当检测到未经授权的操作时，应该引发`homeassistant.exceptions.Unauthorized`异常。这个异常会取消当前的操作，并通知用户他们的操作未经授权。

`Unauthorized`异常具有各种参数，用于识别失败的权限检查。所有字段都是可选的。

| # 并非所有操作都有一个 ID（比如添加配置项）
| # 我们使用这个备用方法来知道未经授权的类别是什么

| 参数 | 描述
| ---- | ----
| context | 当前调用的上下文。
| user_id | 我们尝试操作的用户ID。
| entity_id | 我们尝试操作的实体ID。
| config_entry_id | 我们尝试操作的配置项ID。
| perm_category | 我们测试的权限类别。只在我们没有用户尝试操作的对象ID时才需要（比如创建配置项时）。
| permission | 我们测试的权限，如`POLICY_READ`。

### 保护服务调用处理程序

服务调用允许用户控制实体或整个集成。服务调用使用附加的上下文来查看哪个用户调用了命令。因为使用了上下文，所以很重要的一点是您还要将调用上下文传递给所有服务调用。

通过实体组件注册的所有服务（`component.async_register_entity_service()`）将自动进行权限检查。

#### 检查实体权限

服务调用处理程序将需要检查它将要操作的每个实体的权限。

```python
from homeassistant.exceptions import Unauthorized, UnknownUser
from homeassistant.auth.permissions.const import POLICY_CONTROL


async def handle_entity_service(call):
    """Handle a service call."""
    entity_ids = call.data["entity_id"]

    for entity_id in entity_ids:
        if call.context.user_id:
            user = await hass.auth.async_get_user(call.context.user_id)

            if user is None:
                raise UnknownUser(
                    context=call.context,
                    entity_id=entity_id,
                    permission=POLICY_CONTROL,
                )

            if not user.permissions.check_entity(entity_id, POLICY_CONTROL):
                raise Unauthorized(
                    context=call.context,
                    entity_id=entity_id,
                    permission=POLICY_CONTROL,
                )

        # Do action on entity


async def async_setup(hass, config):
    hass.services.async_register(DOMAIN, "my_service", handle_entity_service)
    return True
```

#### Checking admin permission

Starting Home Assistant 0.90, there is a special decorator to help protect
services that require admin access.

```python
# New in Home Assistant 0.90
async def handle_admin_service(call):
    """Handle a service call."""
    # Do admin action


async def async_setup(hass, config):
    hass.helpers.service.async_register_admin_service(
        DOMAIN, "my_service", handle_admin_service, vol.Schema({})
    )
    return True
```

### Securing a REST API endpoint

```python
from homeassistant.core import Context
from homeassistant.components.http.view import HomeAssistantView
from homeassistant.exceptions import Unauthorized


class MyView(HomeAssistantView):
    """View to handle Status requests."""

    url = "/api/my-component/my-api"
    name = "api:my-component:my-api"

    async def post(self, request):
        """Notify that the API is running."""
        hass = request.app["hass"]
        user = request["hass_user"]

        if not user.is_admin:
            raise Unauthorized()

        hass.bus.async_fire(
            "my-component-api-running", context=Context(user_id=user.id)
        )

        return self.json_message("Done.")
```

### 保护 WebSocket API 端点

在 WebSocket API 端点中验证权限可以通过访问`connection.user`来完成对用户的访问。如果您需要检查管理员访问权限，可以使用内置的`@require_admin`装饰器。

```python
from homeassistant.components import websocket_api


async def async_setup(hass, config):
    hass.components.websocket_api.async_register_command(websocket_create)
    return True


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): "my-component/my-action",}
)
async def websocket_create(hass, connection, msg):
    """Create a user."""
    # Do action
```
