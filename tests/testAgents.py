import ollama

# Define the systems
class SystemOne:
    @staticmethod
    def process(data):
        return f"SystemOne processed: {data}"

class SystemTwo:
    @staticmethod
    def process(data):
        return f"SystemTwo processed: {data}"

class SystemThree:
    @staticmethod
    def process(data):
        return f"SystemThree processed: {data}"

# Delegator agent using Ollama LLM
class LLMDelegatorAgent:
    def __init__(self):
        # Map keywords or system names to callable functions
        self.systems = {
            "SystemOne": SystemOne.process,
            "SystemTwo": SystemTwo.process,
            "SystemThree": SystemThree.process,
        }
        # Initialize Ollama client
        self.client = ollama.Client()
    def delegate(self, query):
        """
        Use the LLM to decide which system to call based on the input query.
        :param query: The natural language input describing the task.
        :return: The result of the selected syst1em's process function.
        """
        # Define the delegator's behavior via the prompt
        prompt = f"""
        You are a task delegator. Based on the query, decide which of the following systems to call:
        1. SystemOne: Handles data analysis tasks.
        2. SystemTwo: Manages file operations.
        3. SystemThree: Performs network operations.

        Respond with only the system name (e.g., "SystemOne", "SystemTwo", "SystemThree").
        Query: {query}
        """
        # Ask the LLM which system to use
        response = self.client.chat(model="llama3:latest", messages=[{ 'role': 'user', 'content': prompt }])
        print(response)
        chosen_system = response.get("content")  # Extract the LLM's choice
        # Delegate the task to the chosen system
        if chosen_system in self.systems:
            data = f"Task based on input: {query}"
            return self.systems[chosen_system](data)
        else:
            raise ValueError(f"Unrecognized system name from LLM: {chosen_system}")

# Example usage
if __name__ == "__main__":
    # Create the delegator agent
    agent = LLMDelegatorAgent()

    # Example queries
    queries = [
        "Analyze this data set",
        "Organize these files into folders",
        "Check the network status of our servers",
        "Perform an unsupported task",
    ]

    for query in queries:
        try:
            result = agent.delegate(query)
            print(f"Query: {query}\nResult: {result}\n")
        except ValueError as e:
            print(f"Query: {query}\nError: {e}\n")



## Test 2 - 
import ollama
import requests
from bs4 import BeautifulSoup

available_functions = {'request': requests.request}
response = ollama.chat('llama3.1', messages=[{ 'role': 'user', 'content': 'what are the US election most recent news?'}], tools=[requests.request])

for tool in response.message.tool_calls or []:
    function_to_call = available_functions.get(tool.function.name)
    if function_to_call == requests.request:
        # Make an HTTP request to the URL specified in the tool call
        print(f"Trying to access URL {tool.function.arguments.get('url')}")
        resp = function_to_call(method=tool.function.arguments.get('method'), url=tool.function.arguments.get('url'))
        soup = BeautifulSoup(resp.text, 'html.parser')
        print(soup.get_text(separator='\n', strip=True))
    else:
        print('Function not found:', tool.function.name)