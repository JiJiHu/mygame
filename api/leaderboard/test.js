// 测试 Redis 连接 - 使用 Upstash Pipeline REST API

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
  
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return new Response(JSON.stringify({
      error: '环境变量未配置',
      hasUrl: !!KV_REST_API_URL,
      hasToken: !!KV_REST_API_TOKEN
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Upstash Pipeline REST API 格式
    const body = [
      ["PING"],
      ["ZADD", "test:leaderboard", 100, JSON.stringify({name:'test',score:100})],
      ["ZRANGE", "test:leaderboard", 0, -1]
    ];

    const res = await fetch(`${KV_REST_API_URL}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const result = await res.json();

    return new Response(JSON.stringify({
      success: res.ok,
      result,
      url: KV_REST_API_URL ? '***' : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
