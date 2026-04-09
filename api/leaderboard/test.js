// 测试 Redis 连接

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new Response(JSON.stringify({
    hasUrl: !!UPSTASH_REDIS_REST_URL,
    hasToken: !!UPSTASH_REDIS_REST_TOKEN,
    url: UPSTASH_REDIS_REST_URL ? '***' : null,
    token: UPSTASH_REDIS_REST_TOKEN ? '***' : null
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
