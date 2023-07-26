---
title: "创建你的第一个集成(Integration)"
---

好的,现在就可以为你的第一个集成编写代码了. 超级棒. 别担心, 我们已经尽力让这件事事儿变得简单. 在Home Assistant开发环境中, 输入以下内容并按照说明进行操作:

```shell
python3 -m script.scaffold integration
```

This will set you up with everything that you need to build an integration that is able to be set up via the user interface. More extensive examples of integrations are available from [our example repository](https://github.com/home-assistant/example-custom-config/tree/master/custom_components/).

## The minimum

The scaffold integration contains a bit more than just the bare minimum. The minimum is that you define a `DOMAIN` constant that contains the domain of the integration. The second part is that it needs to define a setup method that returns a boolean if the set up was successful.

```python
DOMAIN = "hello_state"


def setup(hass, config):
    hass.states.set("hello_state.world", "Paulus")

    # Return boolean to indicate that initialization was successful.
    return True
```

And if you prefer an async component:

```python
DOMAIN = "hello_state"


async def async_setup(hass, config):
    hass.states.async_set("hello_state.world", "Paulus")

    # Return boolean to indicate that initialization was successful.
    return True
```
Create a file `<config_dir>/custom_components/hello_state/__init__.py` with one of the two codeblocks.
In addition a manifest file is required with below keys as the bare minimum. Create `<config_dir>/custom_components/hello_state/manifest.json`.

```json
{
  "domain": "hello_state",
  "name": "Hello, state!",
  "version": "0.1.0"
}
```

To load this, add `hello_state:` to your `configuration.yaml` file. 

## What the scaffold offers

When using the scaffold script, it will go past the bare minimum of an integration. It will include a config flow, tests for the config flow and basic translation infrastructure to provide internationalization for your config flow.
