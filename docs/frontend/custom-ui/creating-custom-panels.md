---
title: "Creating custom panels 创建自定义面板"
---

面板是在Home Assistant中显示信息并允许对其进行控制的页面。面板从侧边栏链接，并以全屏渲染。它们通过JavaScript实时访问Home Assistant对象。应用程序中面板的示例包括仪表板、地图、日志和历史记录。

除了组件注册面板外，用户还可以使用`panel_custom`组件注册面板。这使用户可以快速构建自己的Home Assistant自定义界面。

## 简介

面板被定义为自定义元素。您可以使用任何您想要的框架，只要将其包装成自定义元素即可。要快速开始使用面板，请创建一个新文件`<config>/www/example-panel.js`，并使用以下内容：

```js
import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class ExamplePanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  render() {
    return html`
      <wired-card elevation="2">
        <p>There are ${Object.keys(this.hass.states).length} entities.</p>
        <p>The screen is${this.narrow ? "" : " not"} narrow.</p>
        Configured panel config
        <pre>${JSON.stringify(this.panel.config, undefined, 2)}</pre>
        Current route
        <pre>${JSON.stringify(this.route, undefined, 2)}</pre>
      </wired-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        background-color: #fafafa;
        padding: 16px;
        display: block;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
        max-width: 600px;
        margin: 0 auto;
      }
    `;
  }
}
customElements.define("example-panel", ExamplePanel);
```

然后将以下内容添加到您的`configuration.yaml`：

```yaml
panel_custom:
  - name: example-panel
    # url_path需要对于每个panel_custom配置都是唯一的
    url_path: redirect-server-controls
    sidebar_title: Example Panel
    sidebar_icon: mdi:server
    module_url: /local/example-panel.js
    config:
      # 要向面板提供的数据
      hello: world
```

## API参考

Home Assistant前端将通过在自定义元素上设置属性来向您的面板传递信息。设置以下属性：

| 属性     | 类型   | 描述
| -------- | ------ | -----------
| hass     | object | 当前的Home Assistant状态
| narrow   | boolean | 面板是否应以窄模式呈现
| panel    | object | 面板信息。配置可作为`panel.config`获得。

## JavaScript版本

当前，Home Assistant用户界面以现代JavaScript和旧JavaScript（ES5）提供给浏览器。旧版本具有更广泛的浏览器支持，但代价是文件大小和性能。

如果确实需要以ES5支持运行，您需要在定义元素之前加载ES5自定义元素适配器：

```javascript
window.loadES5Adapter().then(function() {
  customElements.define('my-panel', MyCustomPanel)
});
```