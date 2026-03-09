# CoreAI ExplainGPT

A small full‑stack reference project that exposes a “GPT‑style” tokenizer/embedding
service over FastAPI and visualises the result in a React frontend.  
The idea is to be able to type a sentence, see how BERT/DistilBERT splits it into
word‑pieces, inspect the token ids, compute pairwise cosine similarities,
project the vectors to 2‑D and (eventually) display attention weights.

---

## 💡 Features

* **Backend**  
  * FastAPI application with `/tokenize`, `/embed` (and other) endpoints.
  * Uses HuggingFace `transformers` and PyTorch to load a BERT‑family tokenizer
    and model.
  * Explains WordPiece splits, returns token ids, embeddings, similarities, PCA
    projections, self‑attention data.
  * CORS enabled for the React development server.
  * Simple health check and automatic documentation (`/docs`).

* **Frontend**  
  * React (Create‑React‑App) single‑page interface.
  * Text input component, token view and charts built with `recharts` and
    `framer‑motion`.
  * Talk to the backend at `http://localhost:8000` (proxy supported).

* **Tests**  
  * `pytest`/`pytest‑asyncio` tests in `backend/test_api.py` exercise the API.

---

## 🛠️ Getting started

### Requirements

* Python 3.10+  
* Node.js 16+ / npm  
* Git (for version control)

### Clone the repo

```bash
git clone https://github.com/<your‑user>/CoreAI_ExplainGPT.git
cd CoreAI_ExplainGPT

Backend setup
Create & activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

### Frontend setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

### Running the application

**Backend:**

```bash
cd backend
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

**Frontend:**

```bash
cd frontend
npm start
```

The React app will open at `http://localhost:3000`.

---

## 📁 Project structure

```
CoreAI_ExplainGPT/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── test_api.py          # API tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── components/      # Reusable UI components
│   └── package.json         # Node dependencies
└── README.md
```

---

## 🚀 Usage

1. Start both backend and frontend services.
2. Enter text in the input field.
3. View tokenization results, embeddings, and visualizations.

---

## 📝 API Endpoints

* `GET /docs` – Interactive API documentation
* `POST /tokenize` – Split text into tokens
* `POST /embed` – Generate embeddings and similarities
* `GET /health` – Health check

---

## 🧪 Running tests

```bash
cd backend
pytest test_api.py
```

---

## 📄 License

See LICENSE file for details.