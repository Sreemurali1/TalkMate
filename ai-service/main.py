from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai.errors import ClientError
from dotenv import load_dotenv
import asyncio
import os

load_dotenv()

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

SYSTEM_PROMPT = """
You are TalkMate, a friendly spoken English coach.

Rules:
- Keep responses short (2-3 sentences)
- Encourage confidence
- Never shame grammar mistakes
- Speak naturally like a real friend
- Help users continue the conversation
- Correct gently only when needed
"""

class MessageRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: MessageRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    prompt = f"""
    {SYSTEM_PROMPT}

    User: {request.message}
    """

    try:

        # Retry logic
        for attempt in range(3):

            try:
                response = client.models.generate_content(
                    model="gemini-2.0-flash-lite",
                    contents=prompt
                )

                return {
                    "reply": response.text.strip()
                }

            except ClientError as e:

                # Retry only for rate limit
                if "429" in str(e):
                    await asyncio.sleep(5)
                    continue

                raise e

        raise HTTPException(
            status_code=429,
            detail="AI service busy. Please try again."
        )

    except ClientError as e:

        error_text = str(e)

        if "RESOURCE_EXHAUSTED" in error_text:
            raise HTTPException(
                status_code=429,
                detail="Gemini quota exceeded"
            )

        raise HTTPException(
            status_code=500,
            detail=f"Gemini API Error: {error_text}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server Error: {str(e)}"
        )