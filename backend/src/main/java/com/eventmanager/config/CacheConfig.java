package com.eventmanager.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.support.CompositeCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Single owner of application caching. Caching must always work — without a
 * CacheManager, every @Cacheable/@CacheEvict in the codebase silently no-ops.
 *
 * Strategy: Redis (shared, survives restarts) when a connection factory is
 * configured; in-process Caffeine otherwise (current prod has no Redis).
 * Caffeine also acts as a local L1 in front of Redis so hot reads never pay
 * a network round-trip.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /** Cache name → TTL. Mirrors product expectations (events change often, detail is stable). */
    private static final Map<String, Duration> CACHE_TTLS = Map.of(
            "events", Duration.ofMinutes(5),
            "event-detail", Duration.ofMinutes(15),
            "analytics", Duration.ofMinutes(2),
            "users", Duration.ofMinutes(10)
    );

    private static final Duration LOCAL_L1_TTL = Duration.ofMinutes(2);
    private static final long LOCAL_MAX_ENTRIES = 1_000;

    @Bean
    @Primary
    public CacheManager cacheManager(ObjectProvider<RedisConnectionFactory> redisFactory) {
        RedisConnectionFactory factory = redisFactory.getIfAvailable();
        if (factory == null) {
            // No Redis (current prod): Caffeine is the whole cache.
            return caffeineManager();
        }
        // Redis present: check shared cache first, fall back to the local L1.
        CompositeCacheManager composite = new CompositeCacheManager(redisManager(factory), caffeineManager());
        composite.setFallbackToNoOpCache(false);
        return composite;
    }

    private CaffeineCacheManager caffeineManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(LOCAL_MAX_ENTRIES)
                .expireAfterWrite(LOCAL_L1_TTL));
        CACHE_TTLS.forEach((name, ttl) -> manager.registerCustomCache(name,
                Caffeine.newBuilder().maximumSize(LOCAL_MAX_ENTRIES).expireAfterWrite(ttl).build()));
        return manager;
    }

    private RedisCacheManager redisManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        CACHE_TTLS.forEach((name, ttl) -> cacheConfigs.put(name, defaultConfig.entryTtl(ttl)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }
}
