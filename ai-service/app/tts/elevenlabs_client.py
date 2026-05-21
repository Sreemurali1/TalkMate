import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

def text_to_speech(text: str) -> bytes:
    audio = client.text_to_speech.convert(
        voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah — natural American female voice
        text=text,
        model_id="eleven_turbo_v2",
    )
    audio_bytes = b"".join(audio)
    return audio_bytes
    