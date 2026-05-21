from fastapi import APIRouter, UploadFile, File, HTTPException
from deepgram import DeepgramClient
import os
import asyncio
from functools import partial
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/stt", tags=["stt"])

def _transcribe_sync(audio_bytes: bytes, mimetype: str) -> str:
    """Run Deepgram transcription synchronously (called in thread pool)."""
    deepgram = DeepgramClient(api_key=os.getenv("DEEPGRAM_API_KEY"))

    response = deepgram.listen.v1.media.transcribe_file(
        request=audio_bytes,
        model="nova-2",
        language="en-IN",
        punctuate=True,
        smart_format=True,
    )

    return response.results.channels[0].alternatives[0].transcript

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        mimetype = audio.content_type or "audio/webm"

        print(f"STT: received {len(audio_bytes)} bytes, mimetype={mimetype}")

        if len(audio_bytes) < 500:
            raise HTTPException(status_code=400, detail="Audio too short")

        # Run blocking Deepgram call in thread pool so it doesn't block the event loop
        loop = asyncio.get_event_loop()
        transcript = await loop.run_in_executor(
            None,
            partial(_transcribe_sync, audio_bytes, mimetype)
        )

        print(f"STT: transcript = '{transcript}'")

        if not transcript.strip():
            raise HTTPException(status_code=400, detail="No speech detected")

        return {"transcript": transcript}

    except HTTPException:
        raise
    except Exception as e:
        print(f"STT error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
