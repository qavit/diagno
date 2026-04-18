from __future__ import annotations
import json
from pathlib import Path
from app.models import Concept, ErrorType, Question

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "seed.json"

def load_data():
    if not DATA_FILE.exists():
        # Fallback to empty if file doesn't exist yet
        return [], [], []
    
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
        
    concepts = [Concept(**c) for c in raw_data.get("concepts", [])]
    error_types = [ErrorType(**e) for e in raw_data.get("error_types", [])]
    questions = [Question(**q) for q in raw_data.get("questions", [])]
    
    return concepts, error_types, questions

# Load data into constants for backward compatibility
CONCEPTS, ERROR_TYPES, QUESTIONS = load_data()

CONCEPT_INDEX = {concept.id: concept for concept in CONCEPTS}
ERROR_INDEX = {error.id: error for error in ERROR_TYPES}
QUESTION_INDEX = {question.id: question for question in QUESTIONS}
