from transformers import AutoTokenizer
from typing import Dict, List, Any

_tokenizers = {}

def get_tokenizer(model_name: str):
    if model_name not in _tokenizers:
        _tokenizers[model_name] = AutoTokenizer.from_pretrained("bert-base-uncased")
    return _tokenizers[model_name]


def tokenize_text(text: str, model: str = "bert") -> Dict[str, Any]:
    tokenizer = get_tokenizer(model)

    tokens = tokenizer.tokenize(text)
    tokens = ["[CLS]"] + tokens + ["[SEP]"]
    token_ids = tokenizer.convert_tokens_to_ids(tokens)

    explained_tokens = []
    split_explanations = []

    for token in tokens:
        if token.startswith("##"):
            explained_tokens.append({
                "token": token,
                "type": "subword",
                "reason": "Continuation of previous token (WordPiece split)"
            })
            split_explanations.append(
                f"{token} is continuation because full word was not in vocabulary."
            )
        else:
            explained_tokens.append({
                "token": token,
                "type": "root",
                "reason": "Token exists independently in vocabulary"
            })

    return {
        "tokens": tokens,
        "token_ids": token_ids,
        "explained_tokens": explained_tokens,
        "wordpiece_explanation": {
            "description": "BERT uses WordPiece. Unknown words are split into known subwords.",
            "details": split_explanations
        }
    }