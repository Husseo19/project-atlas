import abc
from typing import Optional, Type

from openai import OpenAI
from pydantic import BaseModel

class LLMProvider(abc.ABC):
    @abc.abstractmethod
    def generate_structured(self, prompt: str, schema: Type[BaseModel]) -> BaseModel:
        """Generates a structured response based on the provided prompt and Pydantic schema."""
        pass

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def generate_structured(self, prompt: str, schema: Type[BaseModel]) -> BaseModel:
        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert exam question author for Microsoft certifications."},
                {"role": "user", "content": prompt}
            ],
            response_format=schema,
        )
        return response.choices[0].message.parsed
