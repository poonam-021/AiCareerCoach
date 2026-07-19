from pydantic import BaseModel


class ResumeParseResponse(BaseModel):
    skills: list[str]
    experience: list[str]
    education: list[str]
    sections: list[str]