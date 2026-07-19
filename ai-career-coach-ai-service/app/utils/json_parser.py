"""
Shared JSON parser utility.
Extracts clean JSON from LLM responses that may contain markdown fences.
"""
import json
import re
import logging

logger = logging.getLogger(__name__)


def extract_json(text: str) -> dict | list:
    """
    Extract and parse JSON from LLM response text.
    Handles:
    - Plain JSON
    - JSON wrapped in ```json ... ``` fences
    - JSON wrapped in ``` ... ``` fences
    - Trailing garbage after JSON
    """
    if not text:
        return {}

    # Strip whitespace
    text = text.strip()

    # Remove markdown code fences
    if "```" in text:
        # Try to extract content between fences
        fence_pattern = r"```(?:json)?\s*([\s\S]*?)```"
        matches = re.findall(fence_pattern, text)
        if matches:
            text = matches[0].strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object or array in the text
    for pattern in [r"\{[\s\S]*\}", r"\[[\s\S]*\]"]:
        matches = re.findall(pattern, text)
        if matches:
            # Try longest match first
            for match in sorted(matches, key=len, reverse=True):
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue

    logger.warning(f"[JSON PARSER] Failed to extract JSON from: {text[:200]}")
    return {"raw": text}


def extract_content(response) -> str:
    """
    Extract text content from LangChain LLM response.
    Handles both string and list content formats.
    """
    content = response.content

    if isinstance(content, list):
        text = ""
        for block in content:
            if isinstance(block, dict) and "text" in block:
                text += block["text"]
            else:
                text += str(block)
        return text

    return str(content)
