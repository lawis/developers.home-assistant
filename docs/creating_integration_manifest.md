---
title: "集成清单文件(Manifest.json)定义"
sidebar_label: "清单文件(Manifest.json)"
---

每一个集成都有一个清单文件,用于指定其基本信息. 这个文件就是集成目录中的`manifest.json`文件. 此文件是必须要添加的.

```json
{
  "domain": "hue",
  "name": "Philips Hue",
  "after_dependencies": ["http"],
  "codeowners": ["@balloob"],
  "dependencies": ["mqtt"],
  "documentation": "https://www.home-assistant.io/components/hue",
  "integration_type": "hub",
  "iot_class": "local_polling",
  "issue_tracker": "https://github.com/balloob/hue/issues",
  "loggers": ["aiohue"],
  "requirements": ["aiohue==1.9.1"],
  "quality_scale": "platinum"
}
```

以下是只包含必要内容的示例,您可以将其复制到您的项目中:

```json
{
  "domain": "your_domain_name",
  "name": "Your Integration",
  "codeowners": [],
  "dependencies": [],
  "documentation": "https://www.example.com",
  "integration_type": "hub",
  "iot_class": "cloud_polling",
  "requirements": []
}
```

## Domain(域)

域(Domain)是一个由字符和下划线组成的短名称. 域必须是唯一的, 且不能更改. 例如,移动应用程序集成的域为`mobile_app`. 该集成的所有文件都在`mobile_app/`文件夹中.

## Name(名称)

表示集成的名字(Name)

## Version(版本号)

在核心集成中,版本(Version)可以被省略

自定义集成必须要有版本(Version)信息. 版本号必须是可以被[AwesomeVersion](https://github.com/ludeeus/awesomeversion)库识别的有效版本号.例如[CalVer](https://calver.org/) 或者 [SemVer](https://semver.org/)定义的规范版本号.

## Integration Type(集成类型)

集成分为多种类型. 每个集成都必须在`manifest.json`文件中提供一个`integration_type`, 以描述其主要作用.

:::warning
如果没有设置,我们目前会默认为`hub`. 这个默认值是在过渡期间临时设置的,每个集成都应该设置一个`integration_type`,此值将来会变为必填项.
:::

| 类别 |  描述
| ---- | -----------
| `device` | 控制单个设备,例如 ESPHome. |
| `entity` | 控制一个基本的实体平台, 比如 sensor 或 light. 一般不应该设置成这个. |
| `hardware` | 控制一个硬件的集成, 比如 Raspbery Pi 或者 Hardkernel. 一般不应该设置成这个. |
| `helper` | 控制一个实体来帮助用户进行自动化操作,比如输入 boolean, derivative 或者 group. |
| `hub` | 将多个设备或者服务集中管理的集成,比如 Philips Hue. |
| `service` | 管理单一服务, 比如 DuckDNS 或 AdGuard. |
| `system` | 控制一个系统的集成,这是一个预留类别,一般不应该设置成这个. |
| `virtual` | 其本身并非集成。相反，它指向另一个集成或物联网标准。请参阅[虚拟集成](#virtual-integration)部分. |

:::info
`hub` `service` `device`之间的不同取决于集成的性质. `hub`类型的集成提供了一个管理多个设备和服务的抽象网关. `service` `device` 类型的集成仅提供对单个服务或设备的访问.
:::

## Documentation(文档)

集成的文档地址,用来说明如何使用你的集成. 如果集成被提交到Home Assistant,那么文档地址应该是`https://www.home-assistant.io/integrations/<domain>`

## Issue Tracker(问题跟踪)

集成相关问题的跟踪地址,用户在使用过程中遇到问题时,可以在这里提交问题. 如果集成被提交到Home Assistant,那么此项可以省略. 对于内建集成,Home Assistant会自动生成正确的链接.

## Dependencies(依赖项)

依赖项(Dependencies)可以定义在Home Assistant加载本集成前,必须先要成功加载的其他集成. 把一个集成添加到依赖项中,可以确保本集成在设置之前,依赖的集成已经被加载. 但是这并不能保证所有依赖项的配置都已经完成设置. 如果您需要提供一些来自于其他集成的功能(比如webhooks 或者MQTT connection),那增加依赖项是必要的.如果一个依赖只是可选的,那把它添加到[after dependency](#after-dependencies),是更好的选择.更多关于如何处理MQTT的信息,请参阅[MQTT](#mqtt)部分.

内建集成应该只增加其他内建集成到`dependencies`中.自定义集成可以增加内建或自定义集成到`dependencies`中.

## After dependencies(后依赖项)

此选项用于指定集成可能使用的依赖项. 当`after_dependencies`存在时,集成的设置将等待`after_dependencies`设置完成后,再进行设置. 它还将确保安装`after_dependencies`的要求,以便可以安全地导入集成中的方法. 例如,如果`camera`集成可能在某些配置中使用`stream`集成,则将`stream`添加到`camera`的清单中的`after_dependencies`中,将确保在设置`camera`之前加载`stream`. 如果没有配置`stream`,`camera`仍将加载.

内建集成应该只增加其他内建集成到`after_dependencies`中.自定义集成可以增加内建或自定义集成到`after_dependencies`中.

## Code Owners(代码所有者)

此选项用于指定负责此集成的人员的GitHub用户名或团队名称. 您应该至少在此处添加您的GitHub用户名,以及任何帮助您编写代码人员的用户名.

## Config Flow(配置流)

如果您的集成有一个用来创建配置条目的配置流,则需要指定 `config_flow` 键. 当指定以后,集成中则必须包含 `config_flow.py`文件.

```json
{
  "config_flow": true
}
```

## Requirements (Python依赖包)

通过`pip`正常安装的各种Python库和模块,都可以通过Requirements来添加. Home Assistant会尝试将这些依赖包安装到Home Assistant[配置目录](https://www.home-assistant.io/docs/configuration/)的`deps`子目录中.当然前提是您没有使用`venv`或`path/to/venv/lib/python3.6/site-packages`(运行在虚拟环境中时)之类的内容. 这里会确保所有依赖包在启动时都存在. 如果某些步骤失败,比如缺少模块的编译或其他安装错误,则该组件(component)将无法加载.

Requirements是字符串数组.每一个条目都是兼容`pip`的字符串. 例如,媒体播放器Cast平台依赖于Python包PyChromecast v3.2.0,则需要定义 `["pychromecast==3.2.0"]`.

### 在开发测试期间需要的自定义Python依赖包(requirements)

在开发组件时,可以使用不同版本的依赖包进行测试,只需要两步即可. 使用`pychromecast`作为示例:

```shell
pip install pychromecast==3.2.0 --target ~/.homeassistant/deps
hass --skip-pip-packages pychromecast
```

这样就可以使用指定的依赖包版本,并阻止Home Assistant尝试使用`requirements`中指定的版本覆盖它. 要防止任何依赖包在不特别指定的情况下自动被覆盖,可以使用全局`--skip-pip`参数来启动Home Assistant.

如果您需要修改Python依赖包来支持您的组件,也可以使用`pip install -e`来安装依赖包的开发版本:

```shell
git clone https://github.com/balloob/pychromecast.git
pip install -e ./pychromecast
hass --skip-pip-packages pychromecast
```

也可以使用公共GitHub仓库来安装依赖包,这很有用.例如在发布到PyPI之前,测试对依赖包的更改.下面的示例可以直接从GitHub安装`pycoolmaster`库的`except_connect`分支下的`0.2.2`版本,当然如果已经安装`0.2.2`版本,则不再安装.

```json
{
  "requirements": ["git+https://github.com/issacg/pycoolmaster.git@except_connect#pycoolmaster==0.2.2"]
}
```

### 自定义集成的Python依赖包

自定义集成使用的依赖包,不应该包含核心集成需要的依赖包.具体参考[requirements.txt](https://github.com/home-assistant/core/blob/dev/requirements.txt).

## Loggers

The `loggers` field is a list of names that the integration's requirements use for their [getLogger](https://docs.python.org/3/library/logging.html?highlight=logging#logging.getLogger) calls.

## Bluetooth(蓝牙)

如果您的集成支持通过蓝牙发现设备,您需要在清单文件中增加匹配器(matcher).当匹配器发现了设备,并且用户已经加载了`bluetooth`集成,它会加载您的集成的配置流中的`bluetooth`相关步骤.我们支持通过匹配`connectable` `local_name` `service_uuid` `service_data_uuid` `manufacturer_id` `manufacturer_data_start`来监听并发现蓝牙设备. `manufacturer_data_start`字段需要一个以整型0-255编码的字节列表.清单值是匹配器字典的列表.如果在蓝牙数据中找到了任何指定匹配器的所有项,则会发现您的集成.过滤重复项是由您的配置流来完成的.任何指定的匹配器发现了合法的蓝牙数据,则会通知到您的集成.如果有重复的数据,需要您集成的配置流进行过滤处理.

`local_name`字段的匹配字符串至少要有三个字符,并且前三个字符中不能包含任何匹配模式(patterns).

如果设备只需要广播数据,将`connectable`设置为`false`,这样即使设备不支持连接,也可以接收到来自蓝牙控制器的发现通知.

下面的示例用于匹配Nespresso Prodigio咖啡机:

```json
{
  "bluetooth": [
    {
      "local_name": "Prodigio_*"
    }
  ]
}
```

下面的示例用于匹配SwitchBot和窗帘设备包含128位uuid的服务数据:

```json
{
  "bluetooth": [
    {
      "service_uuid": "cba20d00-224d-11e6-9fb8-0002a5d5c51b"
    }
  ]
}
```

如果你想要匹配16位uuid的服务数据,需要先将其转换成128位uuid,方法是替换`00000000-0000-1000-8000-00805f9b34fb`中的第三个和第四个字节.例如,Switchbot传感器设备的16位uuid是`0xfd3d`,对应的128位uuid就是`0000fd3d-0000-1000-8000-00805f9b34fb`.下面的示例用于匹配SwitchBot传感器设备的16位uuid服务数据:

```json
{
  "bluetooth": [
    {
      "service_data_uuid": "0000fd3d-0000-1000-8000-00805f9b34fb"
    }
  ]
}
```

下面的示例用来匹配HomeKit设备:


```json
{
  "bluetooth": [
    {
      "manufacturer_id": 76,
      "manufacturer_data_start": [6]
    }
  ]
}
```


## Zeroconf(零配置网络)

如果你的集成通过[零配置网络(Zeroconf)](https://en.wikipedia.org/wiki/Zero-configuration_networking)来发现设备等,你可以在清单文件中增加相关类型. 当发现此类设备,并且用户已经加载了`zeroconf`集成,它会加载您的集成的配置流中的`zeroconf`相关步骤. 

Zeroconf是一个列表,所以你可以指定多个类型来匹配.

```json
{
  "zeroconf": ["_googlecast._tcp.local."]
}
```

某些zeroconf类型是非常通用的(比如`_printer._tcp.local.`, `_axis-video._tcp.local.`, `_http._tcp.local`).

Certain zeroconf types are very generic (i.e., `_printer._tcp.local.`, `_axis-video._tcp.local.` or `_http._tcp.local`). 这种情况下,您可以添加 `name` 或者 `properties` 来过滤您需要匹配的设备.

```json
{
  "zeroconf": [
    {"type":"_axis-video._tcp.local.","properties":{"macaddress":"00408c*"}},
    {"type":"_axis-video._tcp.local.","name":"example*"},
    {"type":"_airplay._tcp.local.","properties":{"am":"audioaccessory*"}},
   ]
}
```

请注意,`properties`属性中的所有值都必须是小写的,并且可以包含fnmatch(Unix shell 风格)的通配符.

## SSDP(简单服务发现协议)

如果你的集成支持通过 [SSDP](https://en.wikipedia.org/wiki/Simple_Service_Discovery_Protocol) 发现设备等, 你可以在清单文件中增加相关类型. If the user has the `ssdp` integration loaded, it will load the `ssdp` step of your integration's config flow when it is discovered. We support SSDP discovery by the SSDP ST, USN, EXT, and Server headers (header names in lowercase), as well as data in [UPnP device description](https://openconnectivity.org/developer/specifications/upnp-resources/upnp/basic-device-v1-0/). The manifest value is a list of matcher dictionaries, your integration is discovered if all items of any of the specified matchers are found in the SSDP/UPnP data. It's up to your config flow to filter out duplicates.

The following example has one matcher consisting of three items, all of which must match for discovery to happen by this config.

```json
{
  "ssdp": [
    {
      "st": "roku:ecp",
      "manufacturer": "Roku",
      "deviceType": "urn:roku-com:device:player:1-0"
    }
  ]
}
```

## HomeKit

如果您的集成支持通过HomeKit进行发现，可以将支持的模型名称添加到您的清单文件中。如果用户加载了Zeroconf集成，当发现时，它将加载您集成的配置流程中的HomeKit步骤。

HomeKit发现的工作方式是通过测试发现的模型名称是否以清单文件中指定的任何模型名称开头。

```json
{
  "homekit": {
    "models": [
      "LIFX"
    ]
  }
}
```

通过HomeKit进行发现并不意味着您必须使用HomeKit协议与设备进行通信。您可以按照自己的意愿与设备进行通信。

当由于清单中的条目而将发现信息路由到您的集成时，该发现信息将不再被路由到监听HomeKit zeroconf类型的其他集成。

## MQTT

如果你的集成支持通过MQTT进行发现，你可以添加用于发现的主题。如果用户加载了`mqtt`集成，在发现时它将加载您的集成配置流程中的`mqtt`步骤。

MQTT发现的工作方式是订阅清单文件中指定的MQTT主题。

```json
{
  "mqtt": [
    "tasmota/discovery/#"
  ]
}
```


如果您的集成需要 `mqtt`，确保它被添加到 [dependencies](#dependencies) 中。

依赖于 MQTT 的集成应该使用 `await mqtt.async_wait_for_mqtt_client(hass)` 来等待 MQTT 客户端可用，然后才能订阅。`async_wait_for_mqtt_client` 方法将阻塞并在 MQTT 客户端可用时返回 `True`。

## DHCP

如果您的集成支持通过dhcp进行发现，您可以将该类型添加到您的清单中。如果用户加载了`dhcp`集成，在发现时它将加载您的集成配置流程中的`dhcp`步骤。我们支持通过“hostname”和 [OUI](https://en.wikipedia.org/wiki/Organizationally_unique_identifier) 或者当`registered_devices`设置为`true`时匹配设备注册MAC地址来被动监听DHCP发现。清单值是一个匹配器字典的列表，如果在DHCP数据中找到了任何指定匹配器的所有项目，您的集成就会被发现。由您的配置流来过滤重复项。

如果一个集成想要接收发现流以在设备上线时更新设备的IP地址，但是`hostname`或`oui`匹配范围太广，并且它已经在设备注册中使用`CONNECTION_NETWORK_MAC`注册了mac地址，那么它应该添加一个启用`registered_devices`设为`true`的DHCP条目。

如果集成支持`zeroconf`或`ssdp`，通常应优先选择它们，因为它们通常提供更好的用户体验。

以下示例有三个匹配器，包含两个项目。在任何三个匹配器中的所有项目必须匹配，这样配置流才会进行发现。

举个例子：

- 如果`hostname`是`Rachio-XYZ`，而`macaddress`是`00:9D:6B:55:12:AA`，发现将会发生。
- 如果`hostname`是`Rachio-XYZ`，而`macaddress`是`00:00:00:55:12:AA`，发现将不会发生。
- 如果`hostname`是`NotRachio-XYZ`，而`macaddress`是`00:9D:6B:55:12:AA`，发现将不会发生。

```json
{
  "dhcp": [
    {
    "hostname": "rachio-*",
    "macaddress": "009D6B*"
    },
    {
    "hostname": "rachio-*",
    "macaddress": "F0038C*"
    },
    {
    "hostname": "rachio-*",
    "macaddress": "74C63B*"
    }
  ]
}
```

Example with setting `registered_devices` to `true`:

```json
{
  "dhcp": [
    {
    "hostname": "myintegration-*",
    },
    {
    "registered_devices": true,
    }
  ]
}
```

## USB

如果您的集成支持通过USB进行发现，您可以将该类型添加到您的清单中。如果用户加载了`usb`集成，在发现时它将加载您的集成配置流程中的`usb`步骤。我们通过从USB描述符中提取这些值，支持通过VID（供应商ID）、PID（设备ID）、序列号、制造商和描述来进行发现。有关帮助识别这些值的信息，请参阅[How To Identify A Device](https://wiki.debian.org/HowToIdentifyADevice/USB)。清单值是一个匹配器字典的列表。如果在USB数据中找到了任何指定匹配器的所有项目，您的集成就会被发现。由您的配置流来过滤重复项。

:::warning
一些VID和PID组合被许多不相关的设备使用。例如，VID `10C4` 和 PID `EA60` 匹配任何一颗芯片为Silicon Labs CP2102的USB-串行桥芯片。当匹配这类设备时，重要的是要根据`描述`或其他标识符进行匹配，以避免意外的发现。
:::

以下示例有两个匹配器，包含两个项目。在任何两个匹配器中的所有项目必须匹配，这样配置流才会进行发现。

举个例子：

- 如果`vid`是`AAAA`，而`pid`是`AAAA`，the discovery would happen
- 如果`vid`是`AAAA`，而`pid`是`FFFF`，发现将不会发生。
- 如果`vid`是`CCCC`，而`pid`是`AAAA`，发现将不会发生。
- 如果`vid`是`1234`，`pid`是`ABCD`，`序列号`是`12345678`，`制造商`是`Midway USB`，而`描述`是`Version 12 Zigbee Stick`，the discovery would happen.

```json
{
  "usb": [
    {
    "vid": "AAAA",
    "pid": "AAAA"
    },
    {
    "vid": "BBBB",
    "pid": "BBBB"
    },
    {
    "vid": "1234",
    "pid": "ABCD",
    "serial_number": "1234*",
    "manufacturer": "*midway*",
    "description": "*zigbee*"
    },
  ]
}
```

## Integration Quality Scale(集成质量评价表)

[Integration Quality Scale(集成质量评价表)](https://www.home-assistant.io/docs/quality_scale/) 基于代码质量和用户体验给集成评分. Each level of the quality scale consists of a list of requirements. If an integration matches all requirements, it's considered to have reached that level.

When your integration has no score, then don't add it to the manifest of your integration. However, be sure to look at the [Integration Quality Scale](https://www.home-assistant.io/docs/quality_scale/) list of requirements. It helps to improve the code and user experience tremendously.

我们强烈建议您对您的集成进行评分.

```json
{
 "quality_scale": "silver"
}
```

## IoT Class(IoT 类)

[IoT Class][iot_class] 描述了集成如何与设备或者服务等进行连接. 关于IoT Classes的更多信息,请阅读博文["Classifying the Internet of Things(物联网分类)"][iot_class].

清单中接受以下IoT类:

- `assumed_state`: (假设状态)We are unable to get the state of the device. Best we can do is to assume the state based on our last command.
- `cloud_polling`: (云端轮询)The integration of this device happens via the cloud and requires an active internet connection. Polling the state means that an update might be noticed later.
- `cloud_push`: (云端推送)Integration of this device happens via the cloud and requires an active internet connection. Home Assistant will be notified as soon as a new state is available.
- `local_polling`: (本地轮询)Offers direct communication with device. Polling the state means that an update might be noticed later.
- `local_push`: (本地推送)Offers direct communication with device. Home Assistant will be notified as soon as a new state is available.
- `calculated`: (计算)The integration does not handle communication on its own, but provides a calculated result.

[iot_class]: https://www.home-assistant.io/blog/2016/02/12/classifying-the-internet-of-things/#classifiers

## Virtual integration(虚拟集成)

Some products are supported by integrations that are not named after the product. For example, Roborock vacuums are integrated via the Xiaomi Miio integration, and the IKEA SYMFONISK product line can be used with the Sonos integration.

There are also cases where a product line only supports a standard IoT standards like Zigbee or Z-Wave. For example, the U-tec ultraloq works via Z-Wave and has no specific dedicated integration. 

For end-users, it can be confusing to find how to integrate those products with Home Asssistant. To help with these above cases, Home Assistant has "Virtual integrations". These integrations are not real integrations but are used to help users find the right integration for their device.

A virtual integration is an integration that just has a single manifest file, without any additional code. There are two types of virtual integrations: A virtual integration supported by another integration and one that uses an existing IoT standard.

:::info
Virtual integrations can only be provided by Home Assistant Core and not by custom integrations.
:::

对于一些产品，它们的集成可能名称并不与产品本身相对应。例如，Roborock的吸尘器是通过小米Miio集成进行集成的，而IKEA SYMFONISK产品系列可以与Sonos集成一起使用。

还有一些情况，某个产品系列只支持像Zigbee或Z-Wave这样的标准IoT标准。例如，U-tec的Ultraloq通过Z-Wave工作，没有特定的专用集成。

对于最终用户来说，找到如何将这些产品与Home Assistant集成可能会令人困惑。为了帮助解决这些情况，Home Assistant提供了“虚拟集成”。这些集成并不是真正的集成，而是用于帮助用户找到与其设备匹配的正确集成。

虚拟集成只包含一个清单文件，没有任何其他代码。有两种类型的虚拟集成：由其他集成支持的虚拟集成和使用现有IoT标准的虚拟集成。

:::info
虚拟集成只能由Home Assistant Core提供，而不能由自定义集成提供。
:::

### Supported by

The "Supported by" virtual integration is an integration that points to another integration to provide its implementation. For example, Roborock vacuums are integrated via the Xiaomi Miio (`xiaomi_miio`) integration.

理解"Supported by"虚拟集成是指向另一个集成以提供其实现的集成。举例来说，Roborock吸尘器是通过小米Miio (xiaomi_miio) 集成进行集成的。
Example manifest:

```json
{
  "domain": "roborock",
  "name": "Roborock",
  "integration_type": "virtual",
  "supported_by": "xiaomi_miio",
}
```

The `domain` and `name` are the same as with any other integration, but the `integration_type` is set to `virtual`. 
The logo for the domain of this virtual integration must be added to our [brands repository](https://github.com/home-assistant/brands/), so in this case, a Roborock branding is used.

The `supported_by` is the domain of the integration providing the implementation for this product. In the example above, the Roborock vacuum is supported by the Xiaomi Miio integration and points to its domain `xiaomi_miio`.

Result:

- Roborock is listed on our user documentation website under integrations with an automatically generated stub page that directs the user to the integration to use.
- Roborock is listed in Home Assistant when clicking "add integration". When selected, we explain to the user that this product is integrated using a different integration, then the user continues to the Xioami Miio config flow.

在这种情况下， `domain` 和 `name` 与任何其他集成一样，但 `integration_type` 设置为 `virtual`。此虚拟集成的域的徽标必须添加到我们的[brands存储库](https://github.com/home-assistant/brands/)中，因此在这种情况下，使用了Roborock品牌。

`supported_by` 是为该产品提供实现的集成的域。在上面的例子中，Roborock吸尘器的支持集成是小米Miio，指向其域 `xiaomi_miio`。

结果：

- Roborock会在我们的用户文档网站上列出在集成下，并生成一个自动创建的存根页面，指导用户使用相关集成。
- 在Home Assistant中点击“添加集成”时会列出Roborock。当用户选择该产品时，我们会向用户解释该产品是使用其他集成进行集成的，并继续进行小米Miio的配置流程。

### IoT standards

The "IoT Standards" virtual integration is an integration that uses an existing IoT standard to provide connectivity with the device. For example, the U-tec ultraloq works via Z-Wave and has no specific dedicated integration.

"IoT Standards"虚拟集成是一种利用现有的物联网标准与设备进行连接的集成。例如，U-tec的Ultraloq通过Z-Wave工作，并且没有特定的专用集成。

Example manifest:

```json
{
  "domain": "ultraloq",
  "name": "ultraloq",
  "integration_type": "virtual",
  "iot_standards": ["zwave"],
}

```

The `domain` and `name` are the same as with any other integration, but the `integration_type` is set to `virtual`. 
The logo for the domain of this virtual integration should be added to our [brands repository](https://github.com/home-assistant/brands/).

The `iot_standards` is the standard this product uses for connectivity. In the example above, the U-tech ultraloq products use Z-Wave to integrate with Home Assistant.

Result:

- U-tech ultraloq is listed on our user documentation website under integrations with an automatically generated stub page that directs the user to the integration to use.
- U-tech ultraloq is listed in Home Assistant when clicking "add integration". When selected, we guide the user in adding this Z-Wave device (and in case Z-Wave isn't set up yet, into setting up Z-Wave first).

:::info
Brands also [support setting IoT standards](/docs/creating_integration_brand/#iot-standards).

It is preferred to set IoT standards on the brand level, and only use a virtual
integration in case it would impose confusion for the end user.
:::
在这种情况下，`domain` 和 `name` 与任何其他集成一样，但 `integration_type` 设置为 `virtual`。这种虚拟集成的域的徽标应该添加到我们的[品牌存储库](https://github.com/home-assistant/brands/)中。

`iot_standards` 是该产品用于连接的标准。在上述示例中，U-tech的Ultraloq产品使用Z-Wave与Home Assistant集成。

结果：

- U-tech的Ultraloq会在我们的用户文档网站上列出在集成下，并生成一个自动创建的存根页面，指导用户使用相关集成。
- 在Home Assistant中点击“添加集成”时会列出U-tech的Ultraloq。当用户选择该产品时，我们会引导用户添加此Z-Wave设备（如果尚未设置Z-Wave，则会引导用户先设置Z-Wave）。

:::info
品牌还支持设置物联网标准。

最好在品牌层面设置物联网标准，并仅在会给最终用户带来困惑的情况下使用虚拟集成。
:::