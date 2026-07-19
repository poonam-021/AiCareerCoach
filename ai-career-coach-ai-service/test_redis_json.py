from redis import Redis

from app.core.config import settings

r = Redis.from_url(settings.REDIS_URL, decode_responses=True)

try:
    r.json().set("test_json", "$", {"hello": "world"})
    print("JSON.SET OK")

    data = r.json().get("test_json", "$")
    print("JSON.GET OK")
    print(data)

except Exception as e:
    print(type(e).__name__)
    print(e)