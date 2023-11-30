---
title: "Custom Strategies 定制策略"
---

_在Home Assistant 2021.5中引入。_

策略是生成仪表板配置的JavaScript函数。当用户尚未创建仪表板配置时，会显示一个自动生成的仪表板。该配置是使用内置策略生成的。

开发者可以创建自己的策略来生成仪表板。策略可以使用Home Assistant的所有数据和用户的仪表板配置来创建新内容。

策略可以应用于整个配置或特定视图。

策略在JavaScript文件中定义为自定义元素，并通过[仪表板资源](./registering-resources.md)进行包含。Home Assistant将调用类上的静态函数，而不将其呈现为自定义元素。

## 仪表板策略

仪表板策略负责生成完整的仪表板配置。这可以是从头开始生成，也可以基于传递的现有仪表板配置进行生成。

一个包含信息的信息对象被传递给策略：

| 键 | 描述
| -- | --
| `config` | 用户提供的仪表板配置（如果有）。
| `hass` | Home Assistant对象。
| `narrow` | 当前用户界面是否以窄模式呈现。

```ts
class StrategyDemo {

  static async generateDashboard(info) {

    return {
      title: "Generated Dashboard",
      views: [
        {
          "cards": [
            {
              "type": "markdown",
              "content": `Generated at ${(new Date).toLocaleString()}`
            }
          ]
        }
      ]
    };

  }

}

customElements.define("ll-strategy-my-demo", StrategyDemo);
```

Use the following dashboard configuration to use this strategy:

```yaml
strategy:
  type: custom:my-demo
views: []
```

## 视图策略

视图策略负责生成特定仪表板视图的配置。当用户打开特定视图时，将调用该策略。

一个包含信息的信息对象被传递给策略：

| 键 | 描述
| -- | --
| `view` | 视图配置。
| `config` | 仪表板配置。
| `hass` | Home Assistant对象。
| `narrow` | 当前用户界面是否以窄模式呈现。

```ts
class StrategyDemo {

  static async generateView(info) {

    return {
      "cards": [
        {
          "type": "markdown",
          "content": `Generated at ${(new Date).toLocaleString()}`
        }
      ]
    };

  }

}

customElements.define("ll-strategy-my-demo", StrategyDemo);
```

Use the following dashboard configuration to use this strategy:

```yaml
views:
- strategy:
    type: custom:my-demo
```

## 完整示例

策略的结构使得一个单独的类可以提供仪表板和视图策略的实现。

建议将尽可能多的工作留给视图策略来完成。这样，仪表板将尽快显示给用户。可以通过仪表板生成依赖于其自身策略的视图的配置来实现这一点。

下面的示例将为每个区域创建一个视图，每个视图在网格中显示该区域中的所有实体。

```ts
class StrategyDemo {

  static async generateDashboard(info) {
    // Query all data we need. We will make it available to views by storing it in strategy options.
    const [areas, devices, entities] = await Promise.all([
      info.hass.callWS({ type: "config/area_registry/list" }),
      info.hass.callWS({ type: "config/device_registry/list" }),
      info.hass.callWS({ type: "config/entity_registry/list" }),
    ]);

    // Each view is based on a strategy so we delay rendering until it's opened
    return {
      views: areas.map((area) => ({
        strategy: {
          type: "custom:my-demo",
          options: { area, devices, entities },
        },
        title: area.name,
        path: area.area_id,
      })),
    };
  }

  static async generateView(info) {
    const { area, devices, entities } = info.view.strategy.options;

    const areaDevices = new Set();

    // Find all devices linked to this area
    for (const device of devices) {
      if (device.area_id === area.area_id) {
        areaDevices.add(device.id);
      }
    }

    const cards = [];

    // Find all entities directly linked to this area
    // or linked to a device linked to this area.
    for (const entity of entities) {
      if (
        entity.area_id
          ? entity.area_id === area.area_id
          : areaDevices.has(entity.device_id)
      ) {
        cards.push({
          type: "button",
          entity: entity.entity_id,
        });
      }
    }

    return {
      cards: [
        {
          type: "grid",
          cards,
        },
      ],
    };
  }
}

customElements.define("ll-strategy-my-demo", StrategyDemo);
```

使用以下仪表板配置来使用此策略：

```yaml
strategy:
  type: custom:my-demo
views: []
```
