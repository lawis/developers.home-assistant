---
title: "创建你的第一个集成(Integration)"
---

好的,现在就可以为你的第一个集成编写代码了. 当然,我们已经尽力让这件事事儿变得简单. 在Home Assistant开发环境(Visual Studio Code 自带的终端)中, 输入以下内容并按照说明进行操作:

```shell
python3 -m script.scaffold integration
```

这个命令会通过命令行交互界面来引导你完成集成的创建. 更多的示例可以在[示例仓库](https://developers.home-assistant.io/docs/en/creating_integration_index.html)中查看.

## 最小可执行集成

脚手架集成包含的内容比最小可执行集成要多一些. 最小可执行集成只定义了一个`DOMAIN`常量, 该常量包含集成的域信息. 还需要定义一个`setup`方法, 该方法返回一个布尔值, 用于指示集成是否初始化成功.

```python
DOMAIN = "hello_state"


def setup(hass, config):
    hass.states.set("hello_state.world", "Paulus")

    # Return boolean to indicate that initialization was successful.
    return True
```

如果你需要的是异步执行的集成,可以这样定义:

```python
DOMAIN = "hello_state"


async def async_setup(hass, config):
    hass.states.async_set("hello_state.world", "Paulus")

    # Return boolean to indicate that initialization was successful.
    return True
```
使用以上两个代码块中的一个来创建文件 `<config_dir>/custom_components/hello_state/__init__.py` .此外还需要一个清单(manifest)文件. 使用以下信息来创建文件`<config_dir>/custom_components/hello_state/manifest.json`.

```json
{
  "domain": "hello_state",
  "name": "Hello, state!",
  "version": "0.1.0"
}
```

要加载它,请将`hello_state:`添加到您的`configuration.yaml`文件中.

## 脚手架集成还包含什么

使用脚手架脚本, 会生成比最小可执行集成更多的内容. 脚手架集成包含了配置流,测试配置流,以及方便进行多语言翻译的基本文件结构.
