from langchain_core.prompts import ChatPromptTemplate


resume_parser_prompt = ChatPromptTemplate.from_template(
"""
You are an expert resume parser.

Analyze the following resume:

{resume}

Extract the information and return only JSON.

Format:

{{
    "name": "",
    "skills": [],
    "experience": [],
    "education": []
}}

Do not add explanations.
"""
)