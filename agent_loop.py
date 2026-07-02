"""LangChain agent that drives the t-shirt studio (LangChain 1.x / create_agent).

Two tools:
  - generate_pattern : text idea -> print-ready graphic (OpenAI image model)
  - virtual_tryon    : graphic + customer photo -> composited try-on (GPT-4o vision)

Run standalone for a quick CLI test:
    py agent_loop.py "make a cyberpunk koi fish pattern"
"""
import sys
from pathlib import Path

# allow `py agent_loop.py` from project root to import the backend package
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from config import AGENT_MODEL, require_key
from tools.pattern_tool import pattern_tool
from tools.tryon_tool import tryon_tool

SYSTEM = (
    "You are the AI designer for a premium 3D t-shirt studio. "
    "You can invent new t-shirt patterns from a description and fit them onto a real "
    "customer's photo. When the user describes a design, call generate_pattern. "
    "When they want to see it worn and a customer photo path is available, call "
    "virtual_tryon with the latest pattern and the photo. Be concise and always tell "
    "the user the resulting image URL."
)

TOOLS = [pattern_tool, tryon_tool]


def build_agent():
    require_key()
    llm = ChatOpenAI(model=AGENT_MODEL, temperature=0.4)
    return create_agent(llm, TOOLS, system_prompt=SYSTEM)


def run(message: str, chat_history: list | None = None) -> dict:
    """Invoke the agent and return {'output': <final assistant text>}."""
    agent = build_agent()
    messages = list(chat_history or []) + [{"role": "user", "content": message}]
    result = agent.invoke({"messages": messages})
    final = result["messages"][-1]
    output = getattr(final, "content", None) or (
        final.get("content") if isinstance(final, dict) else str(final)
    )
    return {"output": output, "messages": result["messages"]}


if __name__ == "__main__":
    msg = " ".join(sys.argv[1:]) or "Create a vaporwave palm-tree t-shirt pattern."
    result = run(msg)
    print("\n=== AGENT OUTPUT ===")
    print(result["output"])
