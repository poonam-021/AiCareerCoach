from redis import Redis

from app.core.config import settings

redis = Redis.from_url(settings.REDIS_URL)

keys = redis.keys("*")

print("\nRedis Keys:\n")

for key in keys:
    print(key.decode())