import os
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

def get_deepgram_client():
    return DeepgramClient(DEEPGRAM_API_KEY)

def get_live_options():
    return LiveOptions(
        model="nova-2",
        language="en-IN",
        punctuate=True,
        interim_results=True,
        endpointing=300,
    )