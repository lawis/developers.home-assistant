---
title: "Adding state card"
---
Home Assistant的主要界面是当前实体及其状态的列表。对于系统中的每个实体，都会呈现一个状态卡片。状态卡片将显示一个图标、实体的名称、状态最后更改的时间以及当前状态或与之交互的控件。

![前端中的卡片](/img/en/frontend/frontend-cards1.png)

不分组时，传感器将显示为所谓的徽章，位于状态卡片的顶部。

![前端中的徽章](/img/en/frontend/frontend-badges.png)

不同的徽章位于文件[`/src/components/entity/ha-state-label-badge.ts`](https://github.com/home-assistant/frontend/blob/dev/src/components/entity/ha-state-label-badge.ts)中。

可以通过几个简单的步骤添加自定义卡片类型。以添加一个适用于域`camera`的新状态卡片为例：

1. 在文件[/common/const.ts](https://github.com/home-assistant/frontend/blob/dev/src/common/const.ts)中的`DOMAINS_WITH_CARD`数组中添加`'camera'`。
2. 在文件夹[/state-summary/](https://github.com/home-assistant/frontend/tree/dev/src/state-summary)中创建文件`state-card-camera.js`。
3. 在[state-card-content.js](https://github.com/home-assistant/frontend/blob/dev/src/state-summary/state-card-content.js)中添加`import './state-card-camera.js';`。