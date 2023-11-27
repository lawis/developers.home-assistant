---
title: "Adding type hints to your code"
---
Python中的类型提示是对变量和函数的静态注释，可让人更容易理解代码。请参阅标准库[文档](https://docs.python.org/3/library/typing.html)和这个PyCascades 2018[演讲](https://youtu.be/zKre4DKAB30)。

目前，在Home Assistant中并不需要所有模块都加上类型提示，但我们的目标是尽可能完整地覆盖所有代码。
为了改进和鼓励这一点，在我们的持续集成过程中会对所有代码进行类型检查，并假设一切均已进行了类型检查，除非明确排除了类型检查。

向现有代码库添加类型提示可能是一项艰巨的任务。为了加快这个过程并帮助开发人员进行类型提示，Instagram开发了[`monkeytype`](https://pypi.org/project/MonkeyType/)程序。它会在运行时分析调用，并尝试为代码分配正确的类型提示。

请参阅[这篇Instagram博文](https://instagram-engineering.com/let-your-code-type-hint-itself-introducing-open-source-monkeytype-a855c7284881)，了解使用monkeytype程序所涉及的工作流程。

我们已经添加了一个脚本，用于启动我们的测试套件或测试模块，并告诉`monkeytype`程序分析运行结果。

### 基本工作流程

1. 运行 `script/monkeytype tests/path/to/your_test_module.py`。
2. 运行 `monkeytype stub homeassistant.your_actual_module`。
3. 查看monkeytype生成的类型提示存根的输出。如果不完全错误，将存根应用到模块中。在最后一步中，你可能需要手动编辑类型提示。
4. 运行 `monkeytype apply homeassistant.your_actual_module`。
5. 检查差异并手动修正类型提示（如果需要）。提交、推送分支并创建PR。

**注意：**
对已经存在类型注释的模块应用monkeytype生成的类型提示存根可能会导致错误并无法工作。这个工具对于完全没有类型提示的模块最为有用。

### 包含模块进行严格类型检查

虽然我们鼓励使用类型提示，但目前并不要求我们的集成中都带有类型提示。
默认情况下，我们的CI会静态检查类型提示。如果一个模块已经完全加上了类型提示，可以将该模块添加到位于Home Assistant Core项目根目录下的`.strict-typing`文件中，以启用严格检查。
