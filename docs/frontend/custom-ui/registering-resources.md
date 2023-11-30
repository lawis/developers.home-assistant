---
title: "Registering Resources 注册资源"
---

如果您想要通过自定义卡片、策略或视图扩展Home Assistant界面，您需要加载外部资源。

第一步是使其对Home Assistant前端可访问。这可以通过在配置文件夹中创建一个名为`www`的新目录来完成。创建此目录并重新启动Home Assistant。

重新启动后，您可以将文件放在此目录中。每个文件都可以在UI上通过`/local`路径访问，无需进行身份验证。

下一步是在Home Assistant界面中注册这些资源。通过点击下面的链接访问资源页面：

[![打开您的Home Assistant实例并显示资源。](https://my.home-assistant.io/badges/lovelace_resources.svg)](https://my.home-assistant.io/redirect/lovelace_dashboards/) （注意：重定向后，在右上角点击三个点的菜单。）

:::note

只有在活动用户的配置文件启用了"高级模式"时才能使用此功能。

:::
![Screenshot of the Advanced Mode selector found on the Profile page](/img/en/frontend/frontend-profile-advanced-mode.png)
