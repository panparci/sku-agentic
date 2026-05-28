package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"sku-rumahsakit/config"
)

type RedisRepository struct {
	client *redis.Client
}

func NewRedisRepository(env *config.Env) *RedisRepository {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", env.RedisHost, env.RedisPort),
		Password: env.RedisPwd,
		DB:       env.RedisDB,
	})
	return &RedisRepository{client: client}
}

func (r *RedisRepository) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

func (r *RedisRepository) Get(ctx context.Context, key string) (string, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

func (r *RedisRepository) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	var data string
	switch v := value.(type) {
	case string:
		data = v
	default:
		bytes, _ := json.Marshal(v)
		data = string(bytes)
	}
	return r.client.Set(ctx, key, data, ttl).Err()
}

func (r *RedisRepository) Del(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

func (r *RedisRepository) Close() error {
	return r.client.Close()
}
