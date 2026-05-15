"""
NLTK-based text preprocessing for CV extraction.
Tokenization, stopword removal, and lemmatization improve skill/section matching.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger(__name__)

_nltk_ready = False


def _ensure_nltk_data() -> None:
    global _nltk_ready
    if _nltk_ready:
        return
    import nltk

    packages = (
        "punkt",
        "punkt_tab",
        "stopwords",
        "wordnet",
        "averaged_perceptron_tagger",
        "averaged_perceptron_tagger_eng",
    )
    for pkg in packages:
        try:
            nltk.download(pkg, quiet=True)
        except Exception as exc:
            logger.debug("NLTK download skipped for %s: %s", pkg, exc)
    _nltk_ready = True


def preprocess_cv_text(text: str) -> str:
    """Normalize whitespace and return cleaned text (original casing preserved in output)."""
    if not text or not text.strip():
        return ""
    _ensure_nltk_data()
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned


def normalize_for_match(text: str) -> str:
    """Lowercase, strip punctuation edges, collapse whitespace."""
    if not text:
        return ""
    text = preprocess_cv_text(text).lower()
    return re.sub(r"\s+", " ", text)


def tokenize(text: str, remove_stopwords: bool = True) -> list[str]:
    """Word-tokenize with optional English stopword removal."""
    if not text or not text.strip():
        return []
    _ensure_nltk_data()
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords

    tokens = word_tokenize(text)
    if not remove_stopwords:
        return [t for t in tokens if t.isalnum()]

    stops = set(stopwords.words("english"))
    return [t for t in tokens if t.isalnum() and t.lower() not in stops]


def lemmatize_tokens(tokens: list[str]) -> list[str]:
    """Lemmatize token list (nouns) for dictionary matching."""
    if not tokens:
        return []
    _ensure_nltk_data()
    from nltk.stem import WordNetLemmatizer

    lemmatizer = WordNetLemmatizer()
    return [lemmatizer.lemmatize(t.lower()) for t in tokens if t]


def text_to_lemma_set(text: str) -> set[str]:
    """Full pipeline: tokenize → lemmatize → set."""
    return set(lemmatize_tokens(tokenize(text)))


def skill_in_text(skill: str, text_lower: str, lemma_set: set[str] | None = None) -> bool:
    """
    Match skill via word boundary regex and NLTK lemma overlap.
    """
    pattern = r"\b" + re.escape(skill.lower()) + r"\b"
    if re.search(pattern, text_lower):
        return True
    if lemma_set is None:
        return False
    skill_lemmas = text_to_lemma_set(skill)
    return bool(skill_lemmas & lemma_set)
