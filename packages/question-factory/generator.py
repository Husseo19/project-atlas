from .models import Question, OptionItem, ValidationResult, CitationItem
from .providers import LLMProvider
from typing import List, Optional
import urllib.request
import urllib.parse
import json
import re

def sanitize_input(text: str, max_length: int = 500) -> str:
    if not text:
        return ""
    text = str(text)
    if len(text) > max_length:
        text = text[:max_length]
    return re.sub(r'[^\w\s\-\.\,\:\;]', '', text)

def fetch_microsoft_learn_docs(query: str) -> List[CitationItem]:
    """
    Query Microsoft Learn Search API with semantic scoring and documentation filter.
    """
    try:
        clean_q = re.sub(r'[^\w\s\-\.]', ' ', query).strip()
        encoded = urllib.parse.quote(clean_q)
        url = f"https://learn.microsoft.com/api/search?search={encoded}&locale=en-us&category=Documentation&scoring=semantic&$top=5"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'ProjectAtlas/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get('results', [])
                citations = []
                for item in results:
                    u = item.get('url', '').lower()
                    if not u:
                        continue
                    if '/credentials/certifications/resources/study-guides/' in u:
                        continue
                    if u.endswith('/purview/purview') or u.endswith('/entra/identity/') or u.endswith('/intune/'):
                        continue
                    if u.endswith('/microsoft-365/admin/') or u.endswith('/overview'):
                        continue
                    
                    title = item.get('title', 'Microsoft Learn Documentation').replace(' - Microsoft Learn', '')
                    desc = item.get('description', '') or (item.get('descriptions', [{}])[0].get('content', '') if item.get('descriptions') else '')
                    citations.append(CitationItem(
                        title=title,
                        url=item.get('url', ''),
                        description=desc[:200].strip()
                    ))
                    if len(citations) >= 2:
                        break
                return citations
    except Exception as e:
        print(f"Error fetching Microsoft Learn docs for '{query}': {e}")
    return []

class QuestionGenerator:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def validate_question(self, question: Question) -> ValidationResult:
        # Programmatic schema validation
        opt_ids = [opt.id for opt in question.options]
        if not opt_ids:
            return ValidationResult(is_valid=False, critique="Options list is empty.")
        
        for ca in question.correct_answers:
            if ca not in opt_ids:
                return ValidationResult(is_valid=False, critique=f"Correct answer ID '{ca}' does not exist in options {opt_ids}.")

        if question.type == "MultipleResponse" and len(question.correct_answers) < 2:
            return ValidationResult(is_valid=False, critique="MultipleResponse question must have at least 2 correct answers.")

        if question.type == "FillInTheBlank":
            blank_count = question.content.count("___")
            if blank_count == 0:
                return ValidationResult(is_valid=False, critique="FillInTheBlank question must contain '___' placeholders in content.")
            if blank_count != len(question.correct_answers):
                return ValidationResult(is_valid=False, critique=f"FillInTheBlank has {blank_count} '___' blanks but {len(question.correct_answers)} correct answers.")

        prompt = (
            f"You are a Senior Microsoft Certification Exam Reviewer.\n"
            f"Review this {question.type} question for technical precision, realism, and distractor quality:\n\n"
            f"Question Type: {question.type}\n"
            f"Scenario: {question.content}\n"
            f"Options: {[{'id': o.id, 'text': o.text} for o in question.options]}\n"
            f"Correct Answers: {question.correct_answers}\n"
            f"Explanation: {question.explanation}\n\n"
            f"RULES:\n"
            f"1. Uses current 2024-2026 Microsoft taxonomy (Entra ID, Purview, Intune, Defender XDR).\n"
            f"2. The scenario is a realistic multi-constraint enterprise challenge (not trivial definition recall).\n"
            f"3. Distractors are plausible real features/settings but objectively incorrect under the given scenario constraints.\n"
            f"4. The explanation clearly proves the right answer and explicitly refutes distractors.\n\n"
            f"Respond with is_valid=true/false and critique='OK' or specific fixes."
        )
        return self.provider.generate_structured(prompt, ValidationResult)

    def generate(
        self, 
        objective_text: str, 
        difficulty: str = "medium", 
        question_type: Optional[str] = None,
        previous_questions: List[str] = None
    ) -> Question:
        objective_text = sanitize_input(objective_text)
        difficulty = sanitize_input(difficulty, 50)
        
        # Determine question type if not specified
        target_type = question_type or "MultipleChoice"
        
        # Step 1: Query Microsoft Learn RAG to ground the generation
        rag_citations = fetch_microsoft_learn_docs(objective_text)
        rag_context = ""
        if rag_citations:
            rag_context = "\nOFFICIAL MICROSOFT LEARN REFERENCE CONTEXT:\n" + "\n".join([f"- {c.title}: {c.description}" for c in rag_citations])

        history_context = ""
        if previous_questions and len(previous_questions) > 0:
            history_str = "\n- ".join(previous_questions[:5])
            history_context = (
                f"\n\nAVOID PREVIOUSLY GENERATED SCENARIOS (Ensure a novel technical angle):\n"
                f"- {history_str}"
            )

        type_instructions = {
            "MultipleChoice": (
                "QUESTION TYPE: MultipleChoice (Single Select)\n"
                "- Craft a realistic enterprise scenario (e.g. 5,000 users, Microsoft 365 E5 / Entra ID P2, hybrid AD).\n"
                "- Include specific constraints: 'with least administrative effort' or 'least privilege'.\n"
                "- Provide exactly 4 options with IDs 'opt_0', 'opt_1', 'opt_2', 'opt_3'.\n"
                "- Exactly 1 option ID in correct_answers."
            ),
            "MultipleResponse": (
                "QUESTION TYPE: MultipleResponse (Multi-Select)\n"
                "- Craft a scenario requiring composite configuration (e.g. 2 or 3 interdependent steps).\n"
                "- Prompt MUST end with: 'Which two actions should you perform? Each correct answer presents part of the solution.' (or 'Which three actions...').\n"
                "- Provide 5 or 6 options with IDs 'opt_0' through 'opt_4' (or 'opt_5').\n"
                "- Exactly 2 or 3 matching option IDs in correct_answers."
            ),
            "FillInTheBlank": (
                "QUESTION TYPE: FillInTheBlank (Hotspot / Dropdown Matrix)\n"
                "- Present a scenario with a formatted table or policy statement containing exactly 2 or 3 '___' inline dropdown placeholders.\n"
                "- Example format in content:\n"
                "  To configure the conditional access policy:\n"
                "  1. Under Target Resources, select: ___\n"
                "  2. Under Grant Controls, select: ___\n"
                "- The options array must list all selectable dropdown choices.\n"
                "- correct_answers must contain the option IDs corresponding to each '___' blank in sequential order."
            ),
            "DragAndDrop": (
                "QUESTION TYPE: DragAndDrop (Ordered Process / Sequence)\n"
                "- Prompt: 'You need to [perform task]. Which four actions should you perform in sequence? To answer, arrange the appropriate actions in the correct order.'\n"
                "- Provide 4 to 6 action options.\n"
                "- correct_answers must list the option IDs in the EXACT sequential order of execution (e.g. ['opt_2', 'opt_0', 'opt_3', 'opt_1'])."
            )
        }

        specific_instruction = type_instructions.get(target_type, type_instructions["MultipleChoice"])

        base_prompt = (
            f"You are a Principal Exam Psychometrician authoring an authentic Microsoft Certification Exam question.\n\n"
            f"TARGET OBJECTIVE: {objective_text}\n"
            f"DIFFICULTY: {difficulty}\n"
            f"{rag_context}\n\n"
            f"{specific_instruction}\n"
            f"{history_context}\n\n"
            f"STRICT TAXONOMY RULES (2024-2026):\n"
            f"- 'Azure AD' -> 'Microsoft Entra ID'\n"
            f"- 'Azure AD PIM' -> 'Microsoft Entra Privileged Identity Management (PIM)'\n"
            f"- 'Compliance Center' -> 'Microsoft Purview portal'\n"
            f"- 'Endpoint Manager' -> 'Microsoft Intune'\n"
            f"- 'Defender' -> 'Microsoft Defender XDR'\n\n"
            f"EXPLANATION REQUIREMENT:\n"
            f"Provide a comprehensive, authoritative technical proof explaining why the correct choice is right and specifically refuting each distractor.\n"
            f"Provide 1 to 2 precise search phrases in 'learn_search_queries' targeting the exact procedure."
        )

        max_retries = 3
        critique_history = ""
        
        for attempt in range(max_retries):
            current_prompt = base_prompt
            if critique_history:
                current_prompt += f"\n\nPREVIOUS ATTEMPTS FAILED VALIDATION:\n{critique_history}\nFIX THESE ISSUES IN YOUR OUTPUT."

            result = self.provider.generate_structured(current_prompt, Question)
            if not isinstance(result, Question):
                raise ValueError("Provider did not return a valid Question instance.")

            # Validate generated question
            validation = self.validate_question(result)
            if validation.is_valid:
                return result
            else:
                critique_history += f"Attempt {attempt+1} Critique: {validation.critique}\n"

        return result

    def generate_adaptive(self, objective_text: str, wrong_answer_text: str, difficulty: str = "medium") -> Question:
        objective_text = sanitize_input(objective_text)
        wrong_answer_text = sanitize_input(wrong_answer_text, 1000)
        difficulty = sanitize_input(difficulty, 50)
        
        rag_citations = fetch_microsoft_learn_docs(objective_text)
        rag_context = ""
        if rag_citations:
            rag_context = "\nOFFICIAL MICROSOFT LEARN REFERENCE CONTEXT:\n" + "\n".join([f"- {c.title}: {c.description}" for c in rag_citations])

        prompt = (
            f"Generate a targeted Microsoft certification scenario question to address a candidate's misconception.\n\n"
            f"Objective: {objective_text}\n"
            f"Candidate's Previous Incorrect Choice/Misconception: '{wrong_answer_text}'\n"
            f"Difficulty: {difficulty}\n"
            f"{rag_context}\n\n"
            f"CRITICAL INSTRUCTION: Generate a scenario question that directly clarifies the difference between '{wrong_answer_text}' and the true solution.\n"
            f"Provide 4 options with IDs 'opt_0', 'opt_1', 'opt_2', 'opt_3', exactly 1 in correct_answers, and a detailed proof explanation."
        )
        
        max_retries = 2
        critique_history = ""
        for attempt in range(max_retries):
            current_prompt = prompt
            if critique_history:
                current_prompt += f"\n\nPREVIOUS ATTEMPTS FAILED VALIDATION:\n{critique_history}\nFIX THESE ISSUES."
                
            result = self.provider.generate_structured(current_prompt, Question)
            validation = self.validate_question(result)
            if validation.is_valid:
                return result
            else:
                critique_history += f"Critique: {validation.critique}\n"
                
        return result
