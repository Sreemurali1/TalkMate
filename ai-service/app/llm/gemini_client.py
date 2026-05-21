import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are TalkMate, a friendly English speaking coach.
Your job is to help users speak English confidently.
Keep responses short (2-3 sentences max).
Never correct grammar directly — model correct usage naturally.
Always be encouraging and positive.
"""

async def get_coaching_response(transcript: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
        contents=transcript,
    )
    return response.text