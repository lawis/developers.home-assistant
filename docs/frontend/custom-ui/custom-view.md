---
title: "Custom View Layout 自定义视图布局"
---

默认情况下，Home Assistant会尝试以类似Pinterest的砌体布局显示卡片。自定义视图布局允许开发人员覆盖此设置并定义布局机制（如网格）。

## API

您将自定义视图定义为[自定义元素](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements)。您可以自行决定如何在元素内部呈现DOM。您可以使用Lit Element、Preact或其他任何流行的框架（除了React-有关React的更多信息，请参阅[此处](https://custom-elements-everywhere.com/#react)）。

自定义视图接收以下内容：

```ts
interface LovelaceViewElement {
  hass?: HomeAssistant;
  lovelace?: Lovelace;
  index?: number;
  cards?: Array<LovelaceCard | HuiErrorCard>;
  badges?: LovelaceBadge[];
  setConfig(config: LovelaceViewConfig): void;
}
```

卡片和徽章将由核心代码创建和维护，并提供给自定义视图。自定义视图旨在加载卡片和徽章，并以自定义的布局显示它们。

## 示例

（注意：此示例未包含所有属性，但足以展示示例）

```js
class MyNewView extends LitElement {
  setConfig(_config) {}

  static get properties() {
    return {
      cards: {type: Array, attribute: false}
    };
  }

  render() {
    if(!this.cards) {
      return html``;
    }
    return html`${this.cards.map((card) => html`<div>${card}</div>`)}`;
  }
}
```

您可以像定义自定义卡片一样在自定义元素注册表中定义此元素：

```js
customElements.define("my-new-view", MyNewView);
```

可以通过将以下内容添加到视图定义中来使用自定义视图：

```yaml
- title: Home View
  type: custom:my-new-view
  badges: [...]
  cards: [...]
```

默认的砌体视图是布局元素的示例。 ([源代码](https://github.com/home-assistant/frontend/blob/master/src/panels/lovelace/views/hui-masonry-view.ts))。

## 存储自定义数据

如果您的视图需要在卡片级别上持久存在数据，则可以使用卡片配置中的`view_layout`来存储信息。例如：键、X和Y坐标、宽度和高度等。当您需要存储视图中卡片的位置或尺寸时，这将非常有用。

```yaml
- type: weather-card
  view_layout:
    key: 1234
    width: 54px
  entity: weather.my_weather
```

## 编辑、删除或添加卡片

要调用核心前端对话框以编辑、删除或添加卡片，您只需要调用以下三个事件即可：

```
事件："ll-delete-card"
详细信息：{ path: [number] | [number, number] }

事件："ll-edit-card"
详细信息：{ path: [number] | [number, number] }


事件："ll-create-card"
详细信息：无
```

要调用事件，可以使用：

```js
// 删除当前视图中的第4个卡片
this.dispatchEvent(new CustomEvent("ll-edit-card", { detail: { path: [3] } })) // this指的是卡片元素
```