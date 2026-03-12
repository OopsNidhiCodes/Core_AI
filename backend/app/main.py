from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from .tokenizer import tokenize_text
from .embeddings import (
    get_bert_embeddings,
    compute_embedding_similarity,
    project_embeddings,
    compute_self_attention
)

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequestModel(BaseModel):
    text: str


@app.post("/tokenize")
async def tokenize(request: RequestModel):

    token_data = tokenize_text(request.text)

    embeddings = get_bert_embeddings(token_data["token_ids"])

    similarity = compute_embedding_similarity(
        token_data["tokens"], embeddings
    )

    graph = project_embeddings(
        token_data["tokens"], embeddings
    )

    attention = compute_self_attention(
        tokens=token_data["tokens"],
        embeddings=embeddings,
        sentence=request.text,
        token_ids=token_data["token_ids"],
    )

    embedding_preview = []
    for i, token in enumerate(token_data["tokens"]):
        embedding_preview.append({
            "token": token,
            "vector_sample": embeddings[i][:8]
        })

    return {
        "user_input": request.text,
        "tokenization": token_data,
        "embedding_matrix": {
            "shape": f"{len(embeddings)} x {len(embeddings[0])}",
            "preview": embedding_preview
        },
        "similarity_table": similarity,
        "embedding_graph": graph,
        "self_attention": attention,
        "timestamp": datetime.now().isoformat()
    }