from fastapi import APIRouter
from pydantic import BaseModel
from app.llm.gemini_client import get_coaching_response
from app.tts.elevenlabs_client import text_to_speech
import base64
import asyncio
from functools import partial

router = APIRouter(prefix="/coaching", tags=["coaching"])

class TranscriptRequest(BaseModel):
    transcript: str

@router.post("/respond")
async def respond(request: TranscriptRequest):
    # Get coaching response from Gemini
    response_text = await get_coaching_response(request.transcript)

    # Run blocking ElevenLabs TTS call in thread pool
    loop = asyncio.get_event_loop()
    audio_bytes = await loop.run_in_executor(
        None,
        partial(text_to_speech, response_text)
    )

    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "response_text": response_text,
        "audio_base64": audio_base64
    }