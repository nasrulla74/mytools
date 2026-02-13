import os
from typing import Optional


class AiService:
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    async def chat(
        self,
        prompt: str,
        provider: str = "anthropic",
        model: Optional[str] = None,
        system_prompt: str = "You are a helpful assistant.",
    ) -> dict:
        try:
            if provider == "anthropic":
                return await self._anthropic_chat(prompt, model, system_prompt)
            elif provider == "openai":
                return await self._openai_chat(prompt, model, system_prompt)
            else:
                return {"error": f"Unknown provider: {provider}"}
        except Exception as e:
            return {"error": str(e)}

    async def _anthropic_chat(self, prompt, model, system_prompt):
        from anthropic import Anthropic

        client = Anthropic(api_key=self.anthropic_key)
        message = client.messages.create(
            model=model or "claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "response": message.content[0].text,
            "model": message.model,
            "usage": {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens,
            },
        }

    async def _openai_chat(self, prompt, model, system_prompt):
        from openai import OpenAI

        client = OpenAI(api_key=self.openai_key)
        response = client.chat.completions.create(
            model=model or "gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return {
            "response": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
            },
        }