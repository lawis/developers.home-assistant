---
title: "Frontend development 前端开发"
sidebar_label: "Development 开发"
---

Home Assistant前端使用Web组件构建。有关我们的技术选择的更多背景信息，请参阅[这篇博文](https://developers.home-assistant.io/blog/2019/05/22/internet-of-things-and-the-modern-web.html)。

:::caution
不要在生产环境中使用开发模式。Home Assistant使用积极的缓存来改善移动体验。在开发过程中，这是禁用的，这样您就不必在更改之间重新启动服务器。
:::

## 设置环境

### 获取代码

第一步是fork[前端代码库][hass-frontend]并添加upstream远程。您可以将fork的代码库放置在系统的任何位置。

```shell
git clone git@github.com:YOUR_GIT_USERNAME/frontend.git
cd frontend
git remote add upstream https://github.com/home-assistant/frontend.git
```

### 配置Home Assistant

您需要设置一个Home Assistant实例。请参阅我们关于[设置开发环境](/development_environment.mdx)的指南。

下一步是配置Home Assistant以使用前端的开发模式。通过在上一步中克隆的前端代码库中更新`configuration.yaml`中的前端配置，并将路径设置为该库的路径：

```yaml
frontend:
  # Example absolute path: /home/paulus/dev/hass/frontend
  development_repo: /path/to/hass/frontend/
```

如果您在使用带有Home Assistant的devcontainers的Visual Studio Code，则需要将`frontend`目录挂载到容器中。将以下部分添加到`.devcontainer/devcontainer.json`文件中：

```json
"mounts": [
  "source=/path/to/hass/frontend,target=/workspaces/frontend,type=bind,consistency=cached"
]
```

需要通过`docker-build` [任务](/development_environment.mdx#tasks)重新构建Home Assistant的devcontainer，并且`configuration.yaml`应该指向容器内部的路径：

```yaml
frontend:
  development_repo: /workspaces/frontend/
```

`.devcontainer/devcontainer.json`的更改应该从任何PR中排除，因为它包含了指向`frontend`代码库的本地路径。

### 安装Node.js

构建前端需要Node.js。首选安装Node.js的方法是使用[nvm](https://github.com/nvm-sh/nvm)。根据[README](https://github.com/nvm-sh/nvm#install--update-script)中的说明安装nvm，并通过运行以下命令安装正确的Node.js版本：

```shell
nvm install
```

[Yarn](https://yarnpkg.com/en/)是用于管理节点模块的包管理器。使用[这里的说明安装yarn。](https://yarnpkg.com/getting-started/install)

接下来，需要安装开发依赖项以启动前端开发环境。首先激活正确的Node版本，然后下载所有依赖项：

```shell
nvm use
script/bootstrap
```

## 开发

在开发过程中，您需要运行开发脚本以维护一个开发构建的前端，当您更改任何源文件时，它会自动更新。要运行这个服务器，请运行：

```shell
nvm use
script/develop
```

确保禁用缓存并正确设置以避免旧内容：

:::info
以下说明适用于Google Chrome
:::

1. 通过在`Network` > `Disable cache`中勾选框来禁用缓存

<p class='img'>
  <img src='/img/en/development/disable-cache.png' />
</p>

2. 在`Application` > `Service Workers` > `Bypass for network`中启用网络绕行

<p class='img'>
  <img src='/img/en/development/bypass-for-network.png' />
</p>

## 创建拉取请求

如果您计划向Home Assistant代码库提出PR，则需要fork前端项目并将您的fork添加为Home Assistant前端库的一个remote。

```shell
git remote add fork <github URL to your fork>
```

当您完成更改并准备推送它们时，切换到前端项目的工作目录，然后推送您的更改

```bash
git add -A
git commit -m "Added new feature X"
git push -u fork HEAD
```

## 构建前端

如果您正在更改前端打包方式，可能需要尝试在主代码库中使用新的打包后的前端版本（而不是将其指向前端代码库）。为此，请通过运行`script/build_frontend`命令构建前端的产品版本。

要在Home Assistant中测试它，请从主Home Assistant代码库运行以下命令：

```shell
pip3 install -e /path/to/hass/frontend/ --config-settings editable_mode=compat
hass --skip-pip-packages home-assistant-frontend
```

[hass-frontend]: https://github.com/home-assistant/frontend
