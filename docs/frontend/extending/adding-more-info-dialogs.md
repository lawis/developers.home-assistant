---
title: "Adding more info dialogs"
---

每当用户点击卡片中的其中一个时，将显示更多信息对话框。此对话框的标题将是状态卡片，然后是该实体在过去24小时的历史记录。在此之下，将渲染用于该实体的更多信息组件。更多信息组件可以显示更多信息或允许更多的控制方式。

<img
  src='/img/en/frontend/frontend-more-info-light.png'
  alt='The more info dialog for a light allows the user to control the color and the brightness.'
/>

添加更多信息对话框的指令与添加新的卡片类型非常相似。以添加适用于域`camera`的新更多信息组件为例：

1. 在文件[/common/const.ts](https://github.com/home-assistant/frontend/blob/dev/src/common/const.ts)中的`DOMAINS_WITH_MORE_INFO`数组中添加`'camera'`。
2. 在文件夹[/dialogs/more-info/controls](https://github.com/home-assistant/frontend/tree/dev/src/dialogs/more-info/controls)中创建文件`more-info-camera.js`。
3. 在[/dialogs/more-info/more-info-content.ts](https://github.com/home-assistant/frontend/blob/dev/src/dialogs/more-info/more-info-content.ts)中添加`import './more-info-camera.js';`。
