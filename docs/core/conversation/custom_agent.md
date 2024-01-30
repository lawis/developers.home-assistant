---
title: Conversation Agent 会话代理
---

对话集成提供了一个标准化的API，供用户使用人类语音与Home Assistant进行交互。实际的人类语音处理由对话代理处理。

集成提供了一个默认的对话代理，它使用我们自己的 [意图识别器](../../voice/intent-recognition) 和 [意图处理器](../../intent_index)。

## 创建自定义对话代理

集成可以提供自定义的对话代理。`async_process` 方法接受一个 `ConversationInput` 对象，其中包含以下数据：

| 名称 | 类型 | 描述
| ---- | ---- | -----------
| `text` | `str` | 用户输入
| `context` | `Context` | 附加到HA中的操作的HA上下文
| `conversation_id` | `Optional[str]` | 用于追踪多轮对话。如果不支持，请返回None
| `language` | `str` | 文本的语言。如果用户没有提供语言，将设置为HA配置的语言。


```python
from homeassistant.helpers import intent
from homeassistant.components.conversation import agent


async def async_setup(hass, config):
    """Initialize your integration."""
    conversation.async_set_agent(hass, MyConversationAgent())


class MyConversationAgent(agent.AbstractConversationAgent):

    @property
    def attribution(self) -> agent.Attribution:
        """Return the attribution."""
        return {
            "name": "My Conversation Agent",
            "url": "https://example.com",
        }

    @abstractmethod
    async def async_process(self, user_input: agent.ConversationInput) -> agent.ConversationResult:
        """Process a sentence."""
        response = intent.IntentResponse(language=user_input.language)
        response.async_set_speech("Test response")
        return agent.ConversationResult(
            conversation_id=None,
            response=response
        )
```
