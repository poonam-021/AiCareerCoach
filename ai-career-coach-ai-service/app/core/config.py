import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    REDIS_URL = os.getenv("REDIS_URL")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
    INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")

settings = Settings()