---
title: "Frontend data 前端数据"
sidebar_label: "Data 数据"
---

前端会传递一个名为`hass`的对象。该对象包含最新的状态，并允许您向服务器发送命令。

每当状态发生变化时，会创建一个新版本的变化对象。因此，您可以通过进行严格的相等性检查轻松地查看是否有变化：

```js
const changed = newVal !== oldVal;
```

为了查看`hass`对象中可用的数据，请在您喜欢的浏览器中打开HomeAssistant前端，并打开浏览器的开发者工具。在元素面板上，选择`<home-assistant>`元素或具有`hass`属性的任何其他元素，然后在控制台面板中运行以下命令：

```js
$0.hass
```

这种读取`hass`对象的方法只应作为参考。为了在您的代码中与`hass`交互，请确保正确传递它。

## 数据

### `hass.states`

这是一个包含Home Assistant中所有实体状态的对象。键是实体ID，值是状态对象。

```json
{
  "sun.sun": {
    "entity_id": "sun.sun",
    "state": "above_horizon",
    "attributes": {
      "next_dawn": "2018-08-18T05:39:19+00:00",
      "next_dusk": "2018-08-17T18:28:52+00:00",
      "next_midnight": "2018-08-18T00:03:51+00:00",
      "next_noon": "2018-08-18T12:03:58+00:00",
      "next_rising": "2018-08-18T06:00:33+00:00",
      "next_setting": "2018-08-17T18:07:37+00:00",
      "elevation": 60.74,
      "azimuth": 297.69,
      "friendly_name": "Sun"
    },
    "last_changed": "2018-08-17T13:46:59.083836+00:00",
    "last_updated": "2018-08-17T13:49:30.378101+00:00",
    "context": {
      "id": "74c2b3b429c844f18e59669e4b41ec6f",
      "user_id": null
    },
  },
  "light.ceiling_lights": {
    "entity_id": "light.ceiling_lights",
    "state": "on",
    "attributes": {
      "min_mireds": 153,
      "max_mireds": 500,
      "brightness": 180,
      "color_temp": 380,
      "hs_color": [
        56,
        86
      ],
      "rgb_color": [
        255,
        240,
        35
      ],
      "xy_color": [
        0.459,
        0.496
      ],
      "white_value": 200,
      "friendly_name": "Ceiling Lights",
      "supported_features": 151
    },
    "last_changed": "2018-08-17T13:46:59.129248+00:00",
    "last_updated": "2018-08-17T13:46:59.129248+00:00",
    "context": {
      "id": "2c6bbbbb66a84a9dae097b6ed6c93383",
      "user_id": null
    },
  }
}
```

### `hass.user`

The logged in user.

```json
{
  "id": "758186e6a1854ee2896efbd593cb542c",
  "name": "Paulus",
  "is_owner": true,
  "is_admin": true,
  "credentials": [
    {
      "auth_provider_type": "homeassistant",
      "auth_provider_id": null
    }
  ]
}
```

## 方法

所有以`call`开头的方法都是异步方法。这意味着它们会返回一个`Promise`，该`Promise`会在调用完成后解析为结果。

### `hass.callService(domain, service, data)`

调用后端上的服务。

```js
hass.callService('light', 'turn_on', {
  entity_id: 'light.kitchen'
});
```

### `hass.callWS(message)`

在后端调用WebSocket命令。

```js
this.hass.callWS({
  type: 'config/auth/create',
  name: 'Paulus',
}).then(userResponse =>
  console.log("Created user", userResponse.user.id));
```

### `hass.callApi(method, path, data)`

在Home Assistant服务器上调用API。例如，如果您要通过向`/api/hassio/backups`发出GET请求来获取所有Home Assistant备份：

```js
hass.callApi('get', 'hassio/backups')
  .then(backups => console.log('Received backups!', backups));
```

如果需要传递数据，请通过第三个参数传递：

```js
hass.callApi('delete', 'notify.html5', { subscription: 'abcdefgh' });
```

:::info
我们正在逐步停止使用API调用，并将所有内容迁移到`hass.callWS(message)`调用上。
:::