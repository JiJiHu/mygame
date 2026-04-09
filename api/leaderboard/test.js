// 测试 Redis 连接 - 使用 Upstash 单命令 REST API

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
    // 单命令格式：POST /command/arg1/arg2
    const pingRes = await fetch(`${KV_REST_API_URL}/ping`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`
      }
    });
    const ping = await pingRes.text();
    
    // ZADD
    const zaddRes = await fetch(`${KV_REST_API_URL}/zadd/test:leaderboard/100/${encodeURIComponent(JSON.stringify({name:'test',score:100}))}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`
      }
    });
    const zadd = await zaddRes.text();
    
    // ZRANGE
    const zrangeRes = await fetch(`${KV_REST_API_URL}/zrange/test:leaderboard/0/-1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`
      }
    });
    const zrange = await zrangeRes.text();

    return new Response(JSON.stringify({
      success: true,
      ping,
      zadd,
      zrange,
      baseUrl: KV_REST_API_URL
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
