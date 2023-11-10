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

If your integration supports discovery via HomeKit, you can add the supported model names to your manifest. If the user has the `zeroconf` integration loaded, it will load the `homekit` step of your integration's config flow when it is discovered.

HomeKit discovery works by testing if the discovered modelname starts with any of the model names specified in the manifest.json.

```json
{
  "homekit": {
    "models": [
      "LIFX"
    ]
  }
}
```

Discovery via HomeKit does not mean that you have to talk the HomeKit protocol to communicate with your device. You can communicate with the device however you see fit.

When a discovery info is routed to your integration because of this entry in your manifest, the discovery info is no longer routed to integrations that listen to the HomeKit zeroconf type.

## MQTT

If your integration supports discovery via MQTT, you can add the topics used for discovery. If the user has the `mqtt` integration loaded, it will load the `mqtt` step of your integration's config flow when it is discovered.

MQTT discovery works by subscribing to MQTT topics specified in the manifest.json.

```json
{
  "mqtt": [
    "tasmota/discovery/#"
  ]
}
```

If your integration requires `mqtt`, make sure it is added to the [dependencies](#dependencies).

Integrations depending on MQTT should wait using `await mqtt.async_wait_for_mqtt_client(hass)` for the MQTT client to become available before they can subscribe. The `async_wait_for_mqtt_client` method will block and return `True` till the MQTT client is available.

## DHCP

If your integration supports discovery via dhcp, you can add the type to your manifest. If the user has the `dhcp` integration loaded, it will load the `dhcp` step of your integration's config flow when it is discovered. We support passively listening for DHCP discovery by the `hostname` and [OUI](https://en.wikipedia.org/wiki/Organizationally_unique_identifier), or matching device registry mac address when `registered_devices` is set to `true`. The manifest value is a list of matcher dictionaries, your integration is discovered if all items of any of the specified matchers are found in the DHCP data. It's up to your config flow to filter out duplicates.

If an integration wants to receive discovery flows to update the IP Address of a device when it comes
online, but a `hostname` or `oui` match would be too broad, and it has registered in the device registry with mac address using the `CONNECTION_NETWORK_MAC`,
it should add a DHCP entry with `registered_devices` set to `true`.

If the integration supports `zeroconf` or `ssdp`, these should be preferred over `dhcp` as it generally offers a better
user experience.

The following example has three matchers consisting of two items. All of the items in any of the three matchers must match for discovery to happen by this config.

For example:

-  If the `hostname` was `Rachio-XYZ` and the `macaddress` was `00:9D:6B:55:12:AA`, the discovery would happen.
-  If the `hostname` was `Rachio-XYZ` and the `macaddress` was `00:00:00:55:12:AA`, the discovery would not happen.
-  If the `hostname` was `NotRachio-XYZ` and the `macaddress` was `00:9D:6B:55:12:AA`, the discovery would not happen.


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

If your integration supports discovery via usb, you can add the type to your manifest. If the user has the `usb` integration loaded, it will load the `usb` step of your integration's config flow when it is discovered. We support discovery by VID (Vendor ID), PID (Device ID), Serial Number, Manufacturer, and Description by extracting these values from the USB descriptor. For help identifiying these values see [How To Identify A Device](https://wiki.debian.org/HowToIdentifyADevice/USB). The manifest value is a list of matcher dictionaries. Your integration is discovered if all items of any of the specified matchers are found in the USB data. It's up to your config flow to filter out duplicates.

:::warning
Some VID and PID combinations are used by many unrelated devices. For example VID `10C4` and PID `EA60` matches any Silicon Labs CP2102 USB-Serial bridge chip. When matching these type of devices, it is important to match on `description` or another identifer to avoid an unexpected discovery.
:::

The following example has two matchers consisting of two items. All of the items in any of the two matchers must match for discovery to happen by this config.

For example:

-  If the `vid` was `AAAA` and the `pid` was `AAAA`, the discovery would happen.
-  If the `vid` was `AAAA` and the `pid` was `FFFF`, the discovery would not happen.
-  If the `vid` was `CCCC` and the `pid` was `AAAA`, the discovery would not happen.
-  If the `vid` was `1234`, the `pid` was `ABCD`, the `serial_number` was `12345678`, the `manufacturer` was `Midway USB`, and the `description` was `Version 12 Zigbee Stick`, the discovery would happen.

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

### Supported by

The "Supported by" virtual integration is an integration that points to another integration to provide its implementation. For example, Roborock vacuums are integrated via the Xiaomi Miio (`xiaomi_miio`) integration.

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

### IoT standards

The "IoT Standards" virtual integration is an integration that uses an existing IoT standard to provide connectivity with the device. For example, the U-tec ultraloq works via Z-Wave and has no specific dedicated integration.

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
