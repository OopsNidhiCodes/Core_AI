import torch
import math
from transformers import AutoModel
from sklearn.decomposition import PCA
import torch.nn.functional as F
from typing import List, Dict, Any

bert_model = AutoModel.from_pretrained("distilbert-base-uncased")
bert_model.eval()


def get_bert_embeddings(token_ids: List[int]):
    with torch.no_grad():
        input_ids = torch.tensor([token_ids])
        outputs = bert_model(input_ids=input_ids)
        embeddings = outputs.last_hidden_state.squeeze(0)

    return embeddings.tolist()


def cosine_similarity(vec1, vec2):
    dot = sum(a*b for a,b in zip(vec1,vec2))
    norm1 = math.sqrt(sum(a*a for a in vec1))
    norm2 = math.sqrt(sum(b*b for b in vec2))
    return dot / (norm1*norm2) if norm1 and norm2 else 0.0


def compute_embedding_similarity(tokens, embeddings):
    results = []
    ignore = {"[CLS]", "[SEP]"}

    for i in range(len(tokens)):
        if tokens[i] in ignore: continue
        for j in range(i+1, len(tokens)):
            if tokens[j] in ignore: continue

            sim = cosine_similarity(embeddings[i], embeddings[j])
            results.append({
                "token_1": tokens[i],
                "token_2": tokens[j],
                "similarity": round(sim,4)
            })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results


def project_embeddings(tokens, embeddings):
    filtered_tokens = []
    filtered_embeddings = []

    for token, vec in zip(tokens, embeddings):
        if token not in ["[CLS]", "[SEP]"]:
            filtered_tokens.append(token)
            filtered_embeddings.append(vec)

    if len(filtered_embeddings) < 2:
        return []

    pca = PCA(n_components=2)
    reduced = pca.fit_transform(filtered_embeddings)

    points = []
    for token, vec in zip(filtered_tokens, reduced):
        points.append({
            "token": token,
            "x": float(vec[0]),
            "y": float(vec[1])
        })

    return points


def compute_self_attention(
    tokens,
    embeddings,
    sentence: str | None = None,
    token_ids: List[int] | None = None,
):
    """
    Compute a self-attention view and return a detailed, step‑by‑step
    explanation payload that the frontend can use to visualize the process.

    If token_ids are provided, the attention weights come from the actual
    DistilBERT model (last layer, averaged across heads). We still build
    synthetic Q, K, V, and score matrices for educational visualization.
    """
    # Use the original user sentence if provided, otherwise join tokens
    example_sentence = sentence if sentence else " ".join(tokens)

    # X: input embeddings matrix (n words × d model size)
    # If token_ids are provided, we use the model's hidden states to align with
    # the real attention weights.
    attention_source = "synthetic"
    if token_ids is not None:
        with torch.no_grad():
            input_ids = torch.tensor([token_ids])
            outputs = bert_model(input_ids=input_ids, output_attentions=True)

            X = outputs.last_hidden_state.squeeze(0).to(dtype=torch.float32)  # (n × d_model)
            all_attn = outputs.attentions  # tuple[num_layers]
            last_layer_attn = all_attn[-1].squeeze(0)  # (num_heads × n × n)
            attention_weights = last_layer_attn.mean(dim=0).to(dtype=torch.float32)  # (n × n)

            seq_len, d_model = X.shape
            num_heads = last_layer_attn.shape[0]
            d_k = d_model // num_heads if num_heads else min(64, d_model)
            attention_source = "distilbert_last_layer_mean_heads"
    else:
        X = torch.tensor(embeddings, dtype=torch.float32)
        seq_len, d_model = X.shape
        d_k = min(64, d_model)

        # Step 5: softmax over keys for each query (row‑wise) for a synthetic attention demo
        attention_weights = None

    # Create trainable-style projection matrices (for visualization).
    # In a real model these are learned parameters; here we keep them deterministic.
    torch.manual_seed(42)
    W_Q = torch.randn(d_model, d_k)
    W_K = torch.randn(d_model, d_k)
    W_V = torch.randn(d_model, d_k)

    # Step 2: Q, K, V
    Q = X @ W_Q  # (n × d_k)
    K = X @ W_K  # (n × d_k)
    V = X @ W_V  # (n × d_k)

    # Step 3: raw attention scores QK^T
    scores = Q @ K.T  # (n × n)

    # Step 4: scale by √d_k
    sqrt_dk = math.sqrt(d_k)
    scaled_scores = scores / sqrt_dk

    # Step 5: attention weights
    # - if we already have real attention from DistilBERT, keep it
    # - otherwise compute softmax from scaled scores (synthetic)
    if attention_weights is None:
        attention_weights = F.softmax(scaled_scores, dim=-1)  # (n × n)

    # Step 6: weighted sum of values
    output = attention_weights @ V  # (n × d_k)

    # Choose one focus token from the user's sentence and explain
    # which other tokens it attends to the most.
    special_tokens = {"[CLS]", "[SEP]"}
    candidate_indices = [i for i, t in enumerate(tokens) if t not in special_tokens]

    if candidate_indices:
        focus_index = candidate_indices[len(candidate_indices) // 2]
    else:
        focus_index = 0

    focus_token = tokens[focus_index] if tokens else ""
    focus_row = attention_weights[focus_index] if tokens else None

    focus_examples = []
    focus_explanation = (
        "Each word distributes its attention across other words in the sentence "
        "to decide which ones matter most for its meaning."
    )

    if focus_row is not None:
        row_values = focus_row.tolist()
        # sort other tokens by how much the focus token attends to them
        indices = [i for i in range(len(tokens)) if i != focus_index]
        top_indices = sorted(
            indices,
            key=lambda j: row_values[j],
            reverse=True
        )[:3]

        for j in top_indices:
            w = row_values[j]
            # Keep full precision for display; avoid showing 0 for tiny values
            focus_examples.append({
                "target_token": tokens[j],
                "attention_weight": round(w, 6),
            })

        if focus_examples:
            def fmt_weight(x):
                return f"{x:.4f}" if x >= 0.0001 else f"{x:.6f}"
            parts = [
                f'"{ex["target_token"]}" (attention {fmt_weight(ex["attention_weight"])})'
                for ex in focus_examples
            ]
            joined = ", ".join(parts)
            focus_explanation = (
                f'The word "{focus_token}" in your sentence looks most at {joined}. '
                "The model uses these words to understand the role and meaning of "
                f'"{focus_token}" in context.'
            )

    # Helpers for compact previews
    def matrix_preview(tensor, max_rows=4, max_cols=4):
        rows = min(tensor.shape[0], max_rows)
        cols = min(tensor.shape[1], max_cols)
        return tensor[:rows, :cols].tolist()

    def shape_str(tensor):
        if tensor.dim() == 2:
            return f"{tensor.shape[0]} x {tensor.shape[1]}"
        return " x ".join(str(x) for x in tensor.shape)

    # Step‑by‑step narrative for the frontend
    detailed_steps = [
        {
            "id": "step0_problem",
            "title": "What Problem Are We Solving?",
            "description": (
                "We want each word in the sentence to look at other words and decide "
                "how much they matter for its meaning. Attention lets each word "
                "distribute focus across all other words."
            ),
            "example_sentence": example_sentence,
            "focus_token": focus_token,
            "focus_examples": focus_examples,
            "focus_explanation": focus_explanation,
            "zero_attention_note": (
                "An attention score of 0 (or very close to 0) means the model assigns "
                "almost no importance to that word when processing the focus word. "
                "Because we are now using attention weights from a trained DistilBERT "
                "layer, higher values usually mark words that the model considers most "
                "relevant for interpreting the focus word in context."
            ),
        },
        {
            "id": "step1_embeddings",
            "title": "Start with Embeddings",
            "description": (
                "Each token is represented as a d‑dimensional vector. Stacking these "
                "vectors gives us the input matrix X ∈ ℝ^{n×d}, where n is the number "
                "of tokens."
            ),
            "why_note": (
                "We write X ∈ ℝ^{n×d} to say: there are n tokens in the sentence, "
                "and each token is described by d numerical features (its embedding "
                "dimensions). Organizing them as a matrix lets the model apply "
                "linear algebra operations (matrix multiplication) to all tokens at "
                "once — for example XW_Q to create queries Q, XW_K for keys, and "
                "XW_V for values."
            ),
            "formula_latex": r"X \in \mathbb{R}^{n \times d}",
            "matrix": {
                "name": "X",
                "shape": shape_str(X),
                "tokens": tokens,
                "preview": matrix_preview(X, max_rows=4, max_cols=4),
            },
        },
        {
            "id": "step2_qkv",
            "title": "Create Q, K, V",
            "description": (
                "We project X into three spaces using learned weight matrices to "
                "produce queries (Q), keys (K), and values (V). These are what the "
                "model uses to compare and combine words."
            ),
            "why_note": (
                "W_Q, W_K, and W_V are trainable parameter matrices. During training, "
                "the model adjusts their values so that queries Q and keys K line up "
                "for words that should attend to each other, and values V carry the "
                "information that will be mixed using those attention weights. "
                "Q, K, and V themselves are not learned parameters — they are computed "
                "on the fly for each input as X is multiplied by these weight matrices."
            ),
            "formula_latex": [
                r"Q = X W_Q",
                r"K = X W_K",
                r"V = X W_V",
                r"W_Q, W_K, W_V \in \mathbb{R}^{d \times d_k}",
                r"Q, K, V \in \mathbb{R}^{n \times d_k}",
            ],
            "shapes": {
                "W_Q": shape_str(W_Q),
                "W_K": shape_str(W_K),
                "W_V": shape_str(W_V),
                "Q": shape_str(Q),
                "K": shape_str(K),
                "V": shape_str(V),
            },
            "previews": {
                "W_Q": matrix_preview(W_Q),
                "Q": matrix_preview(Q),
                "K": matrix_preview(K),
                "V": matrix_preview(V),
            },
        },
        {
            "id": "step3_scores",
            "title": "Compute Attention Scores",
            "description": (
                "We measure similarity between words by taking dot products between "
                "every query and every key: Scores = QKᵀ. Row i shows how much word i "
                "attends to every other word."
            ),
            "why_transpose_note": (
                "Q has shape n×d_k and K has shape n×d_k. To compute a similarity score "
                "between every pair of tokens (query i vs key j), we want a result of "
                "shape n×n. Matrix multiplication requires the inner dimensions to match, "
                "so we transpose K to Kᵀ with shape d_k×n. Then Q (n×d_k) × Kᵀ (d_k×n) "
                "produces Scores with shape n×n, where Scores[i, j] is the dot product "
                "qᵢ · kⱼ."
            ),
            "shape_walkthrough": [
                "Q ∈ ℝ^{n×d_k}",
                "K ∈ ℝ^{n×d_k}",
                "Kᵀ ∈ ℝ^{d_k×n}",
                "Scores = QKᵀ ∈ ℝ^{n×n}",
            ],
            "formula_latex": r"\text{Scores} = Q K^{T}",
            "shapes": {
                "Q": shape_str(Q),
                "K": shape_str(K),
                "K_T": f"{d_k} x {seq_len}",
                "Scores": shape_str(scores),
            },
            "preview": matrix_preview(scores),
        },
        {
            "id": "step4_scale",
            "title": "Scale the Scores",
            "description": (
                "For large d_k, dot products can get large in magnitude. We divide "
                "by √d_k to keep the values in a reasonable range before softmax."
            ),
            "dk_value": int(d_k),
            "sqrt_dk": float(f"{sqrt_dk:.6f}"),
            "formula_latex": r"\frac{Q K^{T}}{\sqrt{d_k}}",
            "preview": matrix_preview(scaled_scores),
        },
        {
            "id": "step5_softmax",
            "title": "Convert Scores to Probabilities",
            "description": (
                "We apply softmax to each row so that attention weights become "
                "probabilities: non‑negative and summing to 1. Each row now "
                "represents how a single word distributes 100% of its attention "
                "across all words."
            ),
            "formula_latex": (
                r"\text{Attention Weights} = "
                r"\text{softmax}\left(\frac{Q K^{T}}{\sqrt{d_k}}\right)"
            ),
            "preview": matrix_preview(attention_weights),
        },
        {
            "id": "step6_weighted_sum",
            "title": "Multiply by V (Weighted Combination)",
            "description": (
                "Finally, each word builds a new representation by taking a weighted "
                "sum of all value vectors V, using the attention weights as "
                "coefficients."
            ),
            "why_note": (
                "Attention weights form an n×n matrix: each row says how much one "
                "word looks at every other word. V is an n×d_k matrix: one value "
                "vector per word. When we multiply Attention (n×n) by V (n×d_k), "
                "the result is an n×d_k matrix where each row is a weighted "
                "combination of all words' value vectors."
            ),
            "formula_latex": (
                r"\text{Output} = "
                r"\text{softmax}\left(\frac{Q K^{T}}{\sqrt{d_k}}\right) V"
            ),
            "shapes": {
                "AttentionWeights": shape_str(attention_weights),
                "V": shape_str(V),
                "Output": shape_str(output),
            },
            "preview": matrix_preview(output),
        },
        {
            "id": "final_attention_formula",
            "title": "Compact Attention Formula",
            "description": (
                "All of the above can be summarized in a single formula, which is "
                "the core building block of Transformer models."
            ),
            "formula_latex": (
                r"\text{Attention}(Q, K, V) = "
                r"\text{softmax}\left(\frac{Q K^{T}}{\sqrt{d_k}}\right) V"
            ),
        },
    ]

    return {
        "tokens": tokens,
        "dimensions": {
            "n": seq_len,
            "d_model": d_model,
            "d_k": d_k,
        },
        "attention_source": attention_source,
        # Backwards‑compatible summary shapes
        "matrix_shapes": {
            "X": shape_str(X),
            "Q": shape_str(Q),
            "K": shape_str(K),
            "V": shape_str(V),
            "Scores": shape_str(scores),
            "AttentionWeights": shape_str(attention_weights),
            "Output": shape_str(output),
        },
        # Compact numeric previews for quick display
        "matrix_previews": {
            "X": matrix_preview(X),
            "Q": matrix_preview(Q),
            "K": matrix_preview(K),
            "V": matrix_preview(V),
            "Scores": matrix_preview(scores),
            "ScaledScores": matrix_preview(scaled_scores),
            "Attention": matrix_preview(attention_weights),
            "Output": matrix_preview(output),
        },
        # Full attention matrix (useful for heatmaps)
        "attention_matrix": attention_weights.tolist(),
        # Detailed narrative steps for the UI to render step‑by‑step
        "detailed_steps": detailed_steps,
        # Original compact formula for quick reference
        "final_formula": "Attention(Q,K,V) = softmax((QK^T)/√dk)V",
    }