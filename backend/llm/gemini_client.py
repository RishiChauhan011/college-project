import os
import logging
from google import genai
from google.genai.errors import ClientError
import json
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Chain last verified against AI Studio: 2026-08-10. Re-check if any model
# in this list starts returning 404s — Google deprecates on short notice.
GEMINI_MODEL_CHAIN = os.getenv(
    "GEMINI_MODEL_CHAIN",
    "gemini-3.1-flash-lite,gemini-3.5-flash,gemini-2.5-flash"
).split(",")

RECOVERABLE_STATUS_CODES = {404, 429, 503}

def _call_gemini_with_model(prompt: str, model: str, client):
    @retry(
        retry=retry_if_exception_type(ClientError),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(2),
        reraise=True,
    )
    def _call():
        return client.models.generate_content(model=model, contents=prompt)
    return _call()

def check_narrative_grounding(narrative: str, recommendation_data: dict) -> list[str]:
    warnings = []
    word_count = len(narrative.split())
    if not (100 <= word_count <= 300):
        warnings.append(f"Word count {word_count} outside expected 150-250 range (soft check).")
    paragraph_count = len([p for p in narrative.split("\n\n") if p.strip()])
    if paragraph_count != 3:
        warnings.append(f"Paragraph count {paragraph_count}, expected 3.")
    return warnings

def generate_roadmap_narrative(recommendation_data: dict) -> dict:
    if not GEMINI_API_KEY:
        return {"narrative": None, "warnings": ["GEMINI_API_KEY not configured"]}
    
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        data_str = json.dumps(recommendation_data, indent=2)
        
        prompt = f"""
Based ONLY on the following structured recommendation data, write a personalized career roadmap for the user.

Recommendation Data:
{data_str}

Strict Constraints:
1. Grounding rule: You may only reference skills, companies, and numbers explicitly present in the input data. Do not invent additional companies, do not estimate salary, and do not suggest skills outside the provided list.
2. Length: 150-250 words, exactly 3 short paragraphs.
3. Formatting: Use **bold** for skill and role names. No markdown headers allowed. No bullet lists longer than 5 items.
4. Tone: Encouraging and practical, not generic motivational filler.
"""
        
        last_error = None

        for i, model in enumerate(GEMINI_MODEL_CHAIN):
            try:
                response = _call_gemini_with_model(prompt, model, client)
                narrative = response.text.strip() if response.text else ""

                if not narrative:
                    logger.warning(
                        "GEMINI_EMPTY_RESPONSE model=%s trying_next=%s",
                        model,
                        GEMINI_MODEL_CHAIN[i + 1] if i + 1 < len(GEMINI_MODEL_CHAIN) else None,
                    )
                    last_error = f"Empty response from model {model}"
                    continue

                warnings = check_narrative_grounding(narrative, recommendation_data)

                if i > 0:
                    logger.warning(
                        "GEMINI_FALLBACK_USED primary=%s used=%s position=%d",
                        GEMINI_MODEL_CHAIN[0], model, i,
                    )
                    warnings.append(f"Primary model unavailable — used fallback: {model}")

                return {"narrative": narrative, "warnings": warnings}

            except ClientError as e:
                status = getattr(e, "code", None) or getattr(e, "status_code", None)
                if status not in RECOVERABLE_STATUS_CODES:
                    logger.error(
                        "GEMINI_NONRECOVERABLE_ERROR model=%s status=%s error=%s",
                        model, status, e, exc_info=True,
                    )
                    return {"narrative": None, "warnings": [f"Generation failed: {str(e)}"]}
                
                logger.warning(
                    "GEMINI_MODEL_UNAVAILABLE model=%s status=%s trying_next=%s",
                    model, status,
                    GEMINI_MODEL_CHAIN[i + 1] if i + 1 < len(GEMINI_MODEL_CHAIN) else None,
                )
                last_error = e
                continue

            except Exception as e:
                logger.warning("GEMINI_MODEL_UNEXPECTED_ERROR model=%s error=%s", model, e)
                last_error = e
                continue

        logger.error("GEMINI_ALL_MODELS_FAILED chain=%s last_error=%s",
                      GEMINI_MODEL_CHAIN, last_error, exc_info=True)
        return {"narrative": None, "warnings": [f"All models unavailable. Last error: {last_error}"]}
        
    except Exception as e:
        logger.error(f"Gemini roadmap generation failed: {e}", exc_info=True)
        return {"narrative": None, "warnings": [f"Generation failed: {str(e)}"]}
