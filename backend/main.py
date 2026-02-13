from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os

from backend.code_runner import CodeRunner
from backend.api_caller import ApiCaller
from backend.ai_service import AiService
from backend.database import init_db, get_db_connection

# Initialize the database
init_db()

app = FastAPI(title="PyTool Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

code_runner = CodeRunner()
api_caller = ApiCaller()
ai_service = AiService()


# --- Request Models ---
class RunCodeRequest(BaseModel):
    code: str
    timeout: int = 30


class ApiCallRequest(BaseModel):
    url: str
    method: str = "GET"
    headers: Optional[dict] = None
    body: Optional[dict] = None
    params: Optional[dict] = None


class AiChatRequest(BaseModel):
    prompt: str
    provider: str = "anthropic"
    model: Optional[str] = None
    system_prompt: str = "You are a helpful assistant."
    api_key: Optional[str] = None

class Website(BaseModel):
    name: str
    link: str
    icon: Optional[str] = None
    description: Optional[str] = None


# --- Endpoints ---
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/run")
async def run_code(req: RunCodeRequest):
    code_runner.timeout = req.timeout
    return code_runner.execute(req.code)


@app.post("/api-call")
async def call_api(req: ApiCallRequest):
    return await api_caller.call(
        url=req.url,
        method=req.method,
        headers=req.headers,
        body=req.body,
        params=req.params,
    )


@app.post("/ai/chat")
async def ai_chat(req: AiChatRequest):
    return await ai_service.chat(
        prompt=req.prompt,
        provider=req.provider,
        model=req.model,
        system_prompt=req.system_prompt,
        api_key=req.api_key,
    )

@app.get("/websites")
async def list_websites():
    conn = get_db_connection()
    websites = conn.execute("SELECT * FROM websites").fetchall()
    conn.close()
    return [dict(w) for w in websites]

@app.post("/websites")
async def add_website(website: Website):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO websites (name, link, icon, description) VALUES (?, ?, ?, ?)",
        (website.name, website.link, website.icon, website.description)
    )
    conn.commit()
    conn.close()
    return {"status": "success"}


# Serve React build in production
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")