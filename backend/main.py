from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

from backend.code_runner import CodeRunner
from backend.api_caller import ApiCaller
from backend.ai_service import AiService
from backend.database import init_db, get_db_connection

# Settings for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Initialize the database
init_db()

app = FastAPI(title="PyTool Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

code_runner = CodeRunner()
api_caller = ApiCaller()
ai_service = AiService()

# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    return username

# --- Request Models ---
class UserAuth(BaseModel):
    username: str
    password: str

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
    provider: Optional[str] = "Cloud"
    provider_link: Optional[str] = ""
    client: Optional[str] = "Self"
    server_ip: Optional[str] = ""
    description: Optional[str] = ""

class Task(BaseModel):
    task_name: str
    category: Optional[str] = "General"
    client: Optional[str] = "Internal"
    status: Optional[str] = "Pending"
    date_created: Optional[str] = None
    date_completed: Optional[str] = None

class Note(BaseModel):
    content: str
    tags: Optional[str] = ""
    ref_link: Optional[str] = ""
    images: Optional[str] = "[]"
    date_created: Optional[str] = None

# --- Auth Endpoints ---
@app.post("/auth/register")
async def register(user: UserAuth):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE username = %s", (user.username,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")
        
        hashed_pwd = get_password_hash(user.password)
        cur.execute("INSERT INTO users (username, hashed_password) VALUES (%s, %s)", (user.username, hashed_pwd))
        conn.commit()
        return {"message": "User registered successfully"}
    finally:
        cur.close()
        conn.close()

@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM users WHERE username = %s", (form_data.username,))
        user = cur.fetchone()
        
        if not user or not verify_password(form_data.password, user['hashed_password']):
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user['username']}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        cur.close()
        conn.close()

# --- Protected App Endpoints ---
@app.get("/me")
async def get_me(username: str = Depends(get_current_user)):
    return {"username": username}

@app.post("/run-code")
async def run_code(req: RunCodeRequest, username: str = Depends(get_current_user)):
    return code_runner.run(req.code, req.timeout)

@app.post("/call-api")
async def call_api(req: ApiCallRequest, username: str = Depends(get_current_user)):
    return await api_caller.call(
        url=req.url,
        method=req.method,
        headers=req.headers,
        body=req.body,
        params=req.params,
    )

@app.post("/ai/chat")
async def ai_chat(req: AiChatRequest, username: str = Depends(get_current_user)):
    return await ai_service.chat(
        prompt=req.prompt,
        provider=req.provider,
        model=req.model,
        system_prompt=req.system_prompt,
        api_key=req.api_key,
    )

@app.get("/websites")
async def list_websites(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM websites")
    websites = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(w) for w in websites]

@app.post("/websites")
async def add_website(website: Website, username: str = Depends(get_current_user)):
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
async def update_website(website_id: int, website: Website, username: str = Depends(get_current_user)):
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
async def list_servers(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM servers")
    servers = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(s) for s in servers]

@app.post("/servers")
async def add_server(server: Server, username: str = Depends(get_current_user)):
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
async def update_server(server_id: int, server: Server, username: str = Depends(get_current_user)):
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
async def list_tasks(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(t) for t in tasks]

@app.post("/tasks")
async def add_task(task: Task, username: str = Depends(get_current_user)):
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
async def update_task(task_id: int, task: Task, username: str = Depends(get_current_user)):
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
async def list_notes(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notes")
    notes = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(n) for n in notes]

@app.post("/notes")
async def add_note(note: Note, username: str = Depends(get_current_user)):
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
async def update_note(note_id: int, note: Note, username: str = Depends(get_current_user)):
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