from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_chat_response(messages: list) -> str:
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful AI assistant for Core AI — "
                    "an educational website that explains how Large Language Models work. "
                    "Help users understand concepts like tokenization, embeddings, attention, "
                    "transformers, and how LLMs work internally. Keep answers clear and beginner-friendly."
                )
            },
            *messages
        ],
        max_tokens=512,
    )
    return completion.choices[0].message.content