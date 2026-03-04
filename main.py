from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from router.model_router import get_model
from rag.rag_engine import RAGEngine


# ✅ Create app ONLY ONCE
app = FastAPI()

# ✅ Add CORS middleware ONCE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = RAGEngine()


class ChatRequest(BaseModel):
    model_name: str
    message: str
    use_rag: bool = False


@app.get("/")
def serve_ui():
    return FileResponse("index.html")


@app.post("/chat")
def chat(request: ChatRequest):

    model = get_model(request.model_name)

    final_prompt = request.message

    if request.use_rag:
        context = rag_engine.get_context(request.message)
        if context:
            final_prompt = f"""
Use the context below to answer clearly.

Context:
{context}

Question:
{request.message}

Answer:
"""

    response = model.generate(final_prompt)

    return {"response": response}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    content = await file.read()
    text = content.decode("utf-8")

    rag_engine.build_from_text(text)

    return {"status": "Document indexed successfully"}