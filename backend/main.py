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
    category: Optional[str] = "General"

class Server(BaseModel):
    server_name: str
    provider: Optional[str] = None
    provider_link: Optional[str] = None
    client: Optional[str] = None
    server_ip: Optional[str] = None
    description: Optional[str] = None

class Task(BaseModel):
    task_name: str
    category: Optional[str] = "General"
    client: Optional[str] = "Internal"
    status: Optional[str] = "Pending"
    date_created: Optional[str] = None
    date_completed: Optional[str] = None

class Note(BaseModel):
    content: str
    tags: Optional[str] = None
    ref_link: Optional[str] = None
    images: Optional[str] = None
    date_created: Optional[str] = None


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
    cur = conn.cursor()
    cur.execute("SELECT * FROM websites")
    websites = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(w) for w in websites]

@app.post("/websites")
async def add_website(website: Website):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO websites (name, link, icon, description, category) VALUES (%s, %s, %s, %s, %s)",
        (website.name, website.link, website.icon, website.description, website.category)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.put("/websites/{website_id}")
async def update_website(website_id: int, website: Website):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE websites SET name = %s, link = %s, icon = %s, description = %s, category = %s WHERE id = %s",
        (website.name, website.link, website.icon, website.description, website.category, website_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.get("/servers")
async def list_servers():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM servers")
    servers = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(s) for s in servers]

@app.post("/servers")
async def add_server(server: Server):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO servers (server_name, provider, provider_link, client, server_ip, description) VALUES (%s, %s, %s, %s, %s, %s)",
        (server.server_name, server.provider, server.provider_link, server.client, server.server_ip, server.description)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.put("/servers/{server_id}")
async def update_server(server_id: int, server: Server):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE servers SET server_name = %s, provider = %s, provider_link = %s, client = %s, server_ip = %s, description = %s WHERE id = %s",
        (server.server_name, server.provider, server.provider_link, server.client, server.server_ip, server.description, server_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.get("/tasks")
async def list_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(t) for t in tasks]

@app.post("/tasks")
async def add_task(task: Task):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks (task_name, category, client, status, date_created, date_completed) VALUES (%s, %s, %s, %s, %s, %s)",
        (task.task_name, task.category, task.client, task.status, task.date_created, task.date_completed)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.put("/tasks/{task_id}")
async def update_task(task_id: int, task: Task):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET task_name = %s, category = %s, client = %s, status = %s, date_created = %s, date_completed = %s WHERE id = %s",
        (task.task_name, task.category, task.client, task.status, task.date_created, task.date_completed, task_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.get("/notes")
async def list_notes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notes")
    notes = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(n) for n in notes]

@app.post("/notes")
async def add_note(note: Note):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO notes (content, tags, ref_link, images, date_created) VALUES (%s, %s, %s, %s, %s)",
        (note.content, note.tags, note.ref_link, note.images, note.date_created)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}

@app.put("/notes/{note_id}")
async def update_note(note_id: int, note: Note):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE notes SET content = %s, tags = %s, ref_link = %s, images = %s, date_created = %s WHERE id = %s",
        (note.content, note.tags, note.ref_link, note.images, note.date_created, note_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "success"}


# Serve React build in production
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")