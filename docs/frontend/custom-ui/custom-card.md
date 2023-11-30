---
title: "Custom Cards"
---

[仪表板](https://www.home-assistant.io/dashboards/) 是我们定义 Home Assistant 用户界面的方法。我们提供了很多内置的卡片，但你不仅仅局限于我们决定包含在 Home Assistant 中的那些卡片。你可以构建并使用你自己的卡片！

## 定义你的卡片

这是一个基本示例，展示了一些可能的内容。

在你的 Home Assistant 配置目录中创建一个名为 `<config>/www/content-card-example.js` 的新文件，并将以下内容放入其中：

```js
class ContentCardExample extends HTMLElement {
  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    // Initialize the content if it's not there yet.
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="Example-card">
          <div class="card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector("div");
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : "unavailable";

    this.content.innerHTML = `
      The state of ${entityId} is ${stateStr}!
      <br><br>
      <img src="http://via.placeholder.com/350x150">
    `;
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
}

customElements.define("content-card-example", ContentCardExample);
```

## 引用你的新卡片

在我们的示例卡片中，我们使用标签 `content-card-example` 定义了一个卡片（请参见最后一行），因此我们的卡片类型将是 `custom:content-card-example`。由于你将文件创建在 `<config>/www` 目录中，因此你可以通过 url `/local/` 在浏览器中访问它（如果你最近添加了 www 文件夹，你需要重新启动 Home Assistant 才能加载文件）。

将一个资源添加到你的仪表板配置中，URL 为 `/local/content-card-example.js`，类型为 `module`（[资源文档](/docs/frontend/custom-ui/registering-resources)）。

然后可以在你的仪表板配置中使用你的卡片：

```yaml
# Example dashboard configuration
views:
  - name: Example
    cards:
      - type: "custom:content-card-example"
        entity: input_boolean.switch_tv
```

## API

自定义卡片以 [自定义元素](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) 的形式定义。你可以决定如何在元素内部渲染你的 DOM。你可以使用 Polymer、Angular、Preact 或任何其他流行的框架（除了 React，[这里有更多关于 React 的信息](https://custom-elements-everywhere.com/#react)）。

当配置更改（很少发生）时，Home Assistant 会调用 `setConfig(config)`。如果配置无效，你可以抛出一个异常，Home Assistant 将渲染一个错误卡片来通知用户。

当 Home Assistant 的状态发生变化时（频繁发生），Home Assistant 会设置[hass 属性](/docs/frontend/data/)。每当状态改变时，组件必须更新自身以表示最新的状态。

你的卡片可以定义一个 `getCardSize` 方法，返回卡片的大小（作为一个数字或解析为数字的 promise）。高度为 1 等同于 50 像素。这将帮助 Home Assistant 平均分配卡片到列中。如果未定义该方法，将假定卡片大小为 `1`。

由于某些元素可能是延迟加载的，如果你想获取另一个元素的卡片大小，你应该先检查该元素是否被定义。

```js
return customElements
  .whenDefined(element.localName)
  .then(() => element.getCardSize());
```

你的卡片可以定义一个 `getConfigElement` 方法，返回一个自定义元素，用于编辑用户配置。Home Assistant 将在仪表板的卡片编辑器中显示该元素。

## 高级示例

加载到仪表板的资源被导入为一个 JS 模块。下面是一个使用 JS 模块的自定义卡片示例，它可以实现所有花哨的功能。

![已连接卡片的屏幕截图](/img/en/frontend/dashboard-custom-card-screenshot.png)

在你的 Home Assistant 配置目录中创建一个名为 `<config>/www/wired-cards.js` 的新文件，并将以下内容放入其中：

```js
import "https://unpkg.com/wired-card@0.8.1/wired-card.js?module";
import "https://unpkg.com/wired-toggle@0.8.0/wired-toggle.js?module";
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

function loadCSS(url) {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

loadCSS("https://fonts.googleapis.com/css?family=Gloria+Hallelujah");

class WiredToggleCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  render() {
    return html`
      <wired-card elevation="2">
        ${this.config.entities.map((ent) => {
          const stateObj = this.hass.states[ent];
          return stateObj
            ? html`
                <div class="state">
                  ${stateObj.attributes.friendly_name}
                  <wired-toggle
                    .checked="${stateObj.state === "on"}"
                    @change="${(ev) => this._toggle(stateObj)}"
                  ></wired-toggle>
                </div>
              `
            : html` <div class="not-found">Entity ${ent} not found.</div> `;
        })}
      </wired-card>
    `;
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error("You need to define entities");
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }

  _toggle(state) {
    this.hass.callService("homeassistant", "toggle", {
      entity_id: state.entity_id,
    });
  }

  static get styles() {
    return css`
      :host {
        font-family: "Gloria Hallelujah", cursive;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
      }
      .state {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .not-found {
        background-color: yellow;
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px;
      }
      wired-toggle {
        margin-left: 8px;
      }
    `;
  }
}
customElements.define("wired-toggle-card", WiredToggleCard);
```

Add a resource to your dashboard config with URL `/local/wired-cards.js` and type `module`.

And for your configuration:

```yaml
# Example dashboard configuration
views:
  - name: Example
    cards:
      - type: "custom:wired-toggle-card"
        entities:
          - input_boolean.switch_ac_kitchen
          - input_boolean.switch_ac_livingroom
          - input_boolean.switch_tv
```

## 图形卡片配置

你的卡片可以定义一个 `getConfigElement` 方法，返回一个自定义元素，用于编辑用户配置。Home Assistant 将在仪表板的卡片编辑器中显示该元素。

你的卡片还可以定义一个 `getStubConfig` 方法，以 json 形式返回一个默认的卡片配置（不包含 `type:` 参数），供仪表板中的卡片类型选择器使用。

Home Assistant 在设置时将调用配置元素的 `setConfig` 方法。
Home Assistant 在状态发生变化时会更新配置元素的 `hass` 属性，以及包含有关仪表板配置的信息的 `lovelace` 元素。

通过调度一个带有新配置的 `config-changed` 事件，将配置的更改发送回仪表板。

要在仪表板的卡片选择对话框中显示你的卡片，请将一个描述卡片的对象添加到数组 `window.customCards` 中。对象的必需属性是 `type` 和 `name`（请参见下面的示例）。

```js
class ContentCardExample extends HTMLElement {
  static getConfigElement() {
    return document.createElement("content-card-editor");
  }

  static getStubConfig() {
    return { entity: "sun.sun" }
  }

  ...
}

customElements.define('content-card-example', ContentCardExample);
```

```js
class ContentCardEditor extends LitElement {
  setConfig(config) {
    this._config = config;
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }
}

customElements.define("content-card-editor", ContentCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "content-card-example",
  name: "Content Card",
  preview: false, // Optional - defaults to false
  description: "A custom card made by me!", // Optional
});
```

## 瓷砖功能

瓷砖卡片支持“功能”，以添加快速操作来控制实体。我们提供了一些内置功能，但你可以使用类似的方式构建和使用自己的功能，就像定义自定义卡片一样。

下面是一个针对[按钮实体](/docs/core/entity/button/)的自定义瓷砖功能示例的屏幕截图：![自定义瓷砖功能示例的屏幕截图](/img/en/frontend/dashboard-custom-tile-feature-screenshot.png)

```js
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const supportsButtonPressTileFeature = (stateObj) => {
  const domain = stateObj.entity_id.split(".")[0];
  return domain === "button";
};

class ButtonPressTileFeature extends LitElement {
  static get properties() {
    return {
      hass: undefined,
      config: undefined,
      stateObj: undefined,
    };
  }

  static getStubConfig() {
    return {
      type: "custom:button-press-tile-feature",
      label: "Press",
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  _press(ev) {
    ev.stopPropagation();
    this.hass.callService("button", "press", {
      entity_id: this.stateObj.entity_id,
    });
  }

  render() {
    if (
      !this.config ||
      !this.hass ||
      !this.stateObj ||
      !supportsButtonPressTileFeature(this.stateObj)
    ) {
      return null;
    }

    return html`
      <div class="container">
        <button class="button" @click=${this._press}>
          ${this.config.label || "Press"}
        </button>
      </div>
    `;
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: row;
        padding: 0 12px 12px 12px;
        width: auto;
      }
      .button {
        display: block;
        width: 100%;
        height: 40px;
        border-radius: 6px;
        border: none;
        background-color: #eeeeee;
        cursor: pointer;
        transition: background-color 180ms ease-in-out;
      }
      .button:hover {
        background-color: #dddddd;
      }
      .button:focus {
        background-color: #cdcdcd;
      }
    `;
  }
}

customElements.define("button-press-tile-feature", ButtonPressTileFeature);

window.customTileFeatures = window.customTileFeatures || [];
window.customTileFeatures.push({
  type: "button-press-tile-feature",
  name: "Button press",
  supported: supportsButtonPressTileFeature, // Optional
  configurable: true, // Optional - defaults to false
});
```

唯一与自定义卡片不同的是图形化配置选项。
要在瓷砖卡片编辑器中显示它，你必须将一个描述该功能的对象添加到数组 `window.customTileFeatures` 中。

对象的必需属性是 `type` 和 `name`。建议使用一个函数定义 `supported` 选项，这样编辑器只会在该功能与瓷砖卡片中选择的实体兼容时才提供该功能。如果你的实体有额外的配置（例如上面示例中的 `label` 选项），请将 `configurable` 设置为 `true`。

此外，静态函数 `getConfigElement` 和 `getStubConfig` 的用法与常规的自定义 map 相同。
