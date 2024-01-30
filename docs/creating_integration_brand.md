---
title: "品牌"
---

一个商业品牌可能有多个集成，这些集成为该品牌下的不同产品提供支持。此外，品牌可能会提供符合物联网标准（例如 Zigbee 或 Z-Wave）的设备。

以第一种情况为例，有多个集成提供对不同谷歌产品的支持，例如 google 集成提供对 Google 日历的支持，google_sheets 集成提供对 Google 表格的支持。

以第二种情况为例，Innovelli 提供 Zigbee 和 Z-Wave 设备，不需要自己的集成。

为了使用户更容易找到这些集成，它们应该被收集在 homeassistant/brands 文件夹中的一个文件中

Examples:
```json
{
  "domain": "google",
  "name": "Google",
  "integrations": ["google", "google_sheets"]
}
```

```json
{
  "domain": "innovelli",
  "name": "Innovelli",
  "iot_standards": ["zigbee", "zwave"]
}
```

Or a minimal example that you can copy into your project:

```json
{
  "domain": "your_brand_domain",
  "name": "Your Brand",
  "integrations": [],
  "iot_standards": []
}
```

## 域名

域名是由字符和下划线组成的简短名称。该域名必须是唯一的，且不能更改。例如，Google 品牌的域名为 `google`。域名键必须与所在的品牌文件的文件名匹配。如果存在具有相同域名的集成，它必须在品牌的 `integrations` 列表中列出。

## 名称

品牌的名称。

## 集成

实现品牌产品的一组集成域。

## 物联网标准

品牌设备支持的物联网标准的列表。可能的值包括 `homekit`、`zigbee` 和 `zwave`。请注意，某些设备可能不支持列出的任何物联网标准。
