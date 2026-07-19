from redis import Redis
from app.core.config import settings

r = Redis.from_url(settings.REDIS_URL)

for key in r.scan_iter("checkpoint*"):
    r.delete(key)

print("Deleted old checkpoints")