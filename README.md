# CoreAI ExplainGPT

A full‑stack reference project that exposes a “GPT‑style” tokenizer/embedding
service over FastAPI and visualises the result in a React frontend.  
The idea is to be able to type a sentence, see how BERT/DistilBERT splits it into
word‑pieces, inspect the token ids, compute pairwise cosine similarities,
project the vectors to 2‑D and (eventually) display attention weights.
The project will provide the overall working of Large Language Models in an easy explainable manner.

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

### Running the application

**Backend:**

1. Create & activate a virtual environment (recommended):

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```
3. (Optional) copy .env.example to .env and set any environment variables.

4. Start the API server:

```bash
cd backend
python run.py
```
The API will be available at `http://localhost:8000`.

**Frontend:**

1. Change to the frontend directory and install packages:

```bash
cd frontend
npm install
```
2. (Optional) add a "proxy": "http://localhost:8000" entry to
package.json if you’d like to use relative URLs in fetch calls.

3. Start the development server:

```bash
npm start
```

The React app will open at `http://localhost:3000`.

---

## 📁 Project structure

```
CoreAI_ExplainGPT/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application, routes, CORS setup
│   │   ├── tokenizer.py    # wrappers around HF AutoTokenizer
│   │   ├── embeddings.py   # compute & explain vectors, cosine, PCA, attention
│   │   └── …  
│   ├── run.py              # entrypoint that imports & runs `app`
│   ├── requirements.txt
│   └── test_api.py
├── frontend/
│   ├── public/             # CRA static assets
│   └── src/
│       ├── components/     # React components (App, TextInput, TokenView)
│       ├── index.js/css
│       └── …
├── .gitignore
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

## 👥 Contributing
Feel free to open issues or pull requests.
Suggested improvements include:

Adding more models or configuration options.
Visualising attention matrices.
Persisting example sentences/demos.
Deploying to a cloud provider.
---

## 📄 License

See LICENSE file for details.