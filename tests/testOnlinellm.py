from llm_axe import OnlineAgent, OllamaChat

llm = OllamaChat(model="llama3:instruct")

onlineAgent = OnlineAgent(llm)

print(onlineAgent.search("Tell me how can I use this tool and what is it about https://github.com/crewAIInc/crewAI/issues/668"))