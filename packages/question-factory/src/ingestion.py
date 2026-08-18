import fitz  # PyMuPDF
from typing import List
import sys
import os

from question_factory.models import StudyObjective, StudyObjectiveList, SyllabusExtractionResult
from question_factory.providers import LLMProvider


class SyllabusIngestor:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def ingest_pdf_bytes(self, pdf_bytes: bytes) -> SyllabusExtractionResult:
        """
        Takes a PDF file as bytes, uses fitz to extract text, and sends it to the 
        LLM provider to return a SyllabusExtractionResult.
        """
        # 1. Extract text
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        # 2. Prepare the prompt
        prompt = (
            "You are an AI assistant parsing a certification syllabus. "
            "Extract the certification name, the certification code, and ALL granular study objectives/skills. "
            "CRITICAL: Do NOT just extract the top-level categories! You must extract every single granular skill or sub-objective "
            "(e.g. the bullet points under the main categories) as a separate StudyObjective. "
            "For example, if a category is 'Implement identities (20%)' and it contains 'Create users' and 'Manage groups', "
            "create separate objectives for 'Create users' and 'Manage groups'. "
            "Assign them a code based on their category (e.g., 'SC-300.1.1', 'SC-300.1.2'). "
            "Estimate the weight of each granular objective based on its parent category's weight evenly distributed, or leave as 0.0. "
            "Return a SyllabusExtractionResult containing all these granular objectives.\n\n"
            f"Syllabus Text:\n{text[:100000]}" # Truncate to avoid exceeding context limits
        )

        # 3. Call LLM Abstraction Layer
        result = self.provider.generate_structured(prompt, SyllabusExtractionResult)
        if not isinstance(result, SyllabusExtractionResult):
            raise ValueError("Provider did not return a valid SyllabusExtractionResult instance.")
        
        return result
