// 测试 Redis 连接

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
    // 测试 PING
    const pingRes = await fetch(`${KV_REST_API_URL}/ping`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([])
    });
    
    const ping = await pingRes.json();
    
    // 测试 ZADD
    const zaddRes = await fetch(`${KV_REST_API_URL}/zadd`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['test:leaderboard', 100, JSON.stringify({name:'test',score:100})])
    });
    
    const zadd = await zaddRes.json();
    
    // 测试 ZRANGE
    const zrangeRes = await fetch(`${KV_REST_API_URL}/zrange`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['test:leaderboard', '0', '-1'])
    });
    
    const zrange = await zrangeRes.json();

    return new Response(JSON.stringify({
      success: true,
      ping,
      zadd,
      zrange,
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
