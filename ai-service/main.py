from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.coaching.router import router as coaching_router
from app.stt.router import router as stt_router

load_dotenv()

app = FastAPI(title="TalkMate AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(coaching_router)
app.include_router(stt_router)

@app.get("/")
def root():
    return {"status": "TalkMate AI service running"}