// 测试 Redis 连接 - 使用 Upstash REST API 格式

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
    // Upstash REST API 格式：POST /command/key/arg1/arg2
    // 或者 POST / 带 body: { "commands": [["set","key","value"]] }
    
    const body = {
      commands: [
        ["ping"],
        ["zadd", "test:leaderboard", 100, JSON.stringify({name:'test',score:100})],
        ["zrange", "test:leaderboard", 0, -1]
      ]
    };

    const res = await fetch(`${KV_REST_API_URL}/`, {
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
