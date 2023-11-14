---
title: "Bluetooth"
sidebar_label: "Building a Bluetooth Integration"
---

集成作者的最佳实践：

- 需要使用蓝牙适配器的集成应该在其`manifest.json`的[`dependencies`](creating_integration_manifest#dependencies)中添加`bluetooth_adapters`。[`manifest.json`](creating_integration_manifest)的条目确保所有支持的远程适配器在集成尝试使用它们之前被连接。

- 在使用`BleakClient`连接蓝牙设备时，始终使用`BLEDevice`对象而不是`address`，以避免客户端启动扫描程序来查找`BLEDevice`。如果只有`address`，请使用`bluetooth.async_ble_device_from_address` API进行调用。

- 调用`bluetooth.async_get_scanner` API获取一个`BleakScanner`实例并将其传递给您的库。返回的扫描程序避免了运行多个扫描程序的开销，这是相当大的。此外，封装的扫描程序将在用户更改蓝牙适配器设置时继续运行。

- 避免在连接之间重用`BleakClient`，因为这会使连接不太可靠。

- 每次建立连接时，从`bluetooth.async_ble_device_from_address` API中获取一个新的`BLEDevice`。或者，使用`bluetooth.async_register_callback`注册一个回调，并在接收到回调时替换缓存的`BLEDevice`。由于活动适配器或环境的更改，`BLEDevice`对象的详细信息可能会发生变化。

- 在连接时使用至少十（10）秒的连接超时，因为`BlueZ`在首次连接到新设备或更新设备时必须解析服务。连接时经常出现临时连接错误，并且第一次尝试连接并不总是成功的。`bleak-retry-connector` PyPI软件包可以消除快速而可靠地建立与设备的连接的猜测工作。

### 可连接和不可连接的蓝牙控制器

Home Assistant支持远程蓝牙控制器。某些控制器仅支持侦听广告数据，而不支持连接到设备。因为许多设备只需要接收广告，所以我们有可连接设备和不可连接设备的概念。如果设备不需要主动连接，则应将`connectable`参数设置为`False`，以接收不支持主动连接的控制器的数据。当`connectable`设置为`False`时，将提供来自`connectable`和不可连接控制器的数据。

`connectable`的默认值为`True`。如果集成的某些设备需要连接，而另一些设备不需要，`manifest.json`应该适当地设置标志。如果无法构造一个匹配器来区分相似设备，请在配置流发现`BluetoothServiceInfoBleak`中检查`connectable`属性，并拒绝需要主动连接的设备的流程。