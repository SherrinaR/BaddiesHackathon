# from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
# import openai

# from hublisten import system_msg
# from hublisten import client

# app = Flask(__name__)
# CORS(app)

# @app.route("/", methods=["GET"])
# def index_get(client):
#     return render_template("index.html")

# @app.route("/chat", methods=["POST"])
# def chat_post():
#     text = request.get_json().get("message")
#     response = system_msg(text)
#     message = {"answer": response}
#     return jsonify(message)

# ----- FROM CHATGPT -----
# api/app.py  (FastAPI)
import os, uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain.chains import RetrievalQA

llm = ChatOpenAI(
    model_name="gpt-4o-mini",
    temperature=0,
    system_prompt=(
        "You are a women’s reproductive-health assistant. "
        "Answer from provided documents only, cite sources, "
        "and include the disclaimer: ‘Informational only…’."
    ),
)

emb = OpenAIEmbeddings()
vectordb = PGVector.from_existing_index(
    embedding_function=emb, 
    collection_name="repro_health_docs"
)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(search_kwargs={"k":4}),
    return_source_documents=True
)

app = FastAPI()

# Allow frontend (React) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(q: str):
    result = qa_chain(q)
    answer = result["result"]
    sources = [
        {"title": s.metadata["title"], "url": s.metadata["source"]}
        for s in result["source_documents"]
    ]
    return {"answer": answer, "sources": sources, "disclaimer":
            "This content is for informational purposes only and not a substitute "
            "for professional medical advice. For personal concerns, consult a qualified clinician."}
