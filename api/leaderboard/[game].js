// Vercel Serverless Function for Leaderboard
// 使用 @upstash/redis SDK

import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    throw new Error('Redis 环境变量未配置');
  }
  
  return new Redis({ url, token });
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const game = pathParts[pathParts.length - 1];
  
  if (!game || game === '[game]') {
    return new Response(JSON.stringify({ success: false, error: '游戏名称不能为空' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const redis = getRedisClient();
    
    if (req.method === 'GET') {
      const leaderboard = await redis.zrange(leaderboard:, 0, 49);
      console.log('ZRange result:', leaderboard);
      const data = leaderboard ? leaderboard.map(item => typeof item === 'string' ? JSON.parse(item) : item) : [];
      
      return new Response(JSON.stringify({ success: true, leaderboard: data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else if (req.method === 'POST') {
      const body = await req.json();
      
      if (!body || (body.score === undefined && body.time === undefined && body.moves === undefined)) {
        return new Response(JSON.stringify({ success: false, error: '无效的分数数据' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const scoreData = { ...body };
      if (scoreData.score === undefined) {
        if (scoreData.moves !== undefined) scoreData.score = scoreData.moves;
        else if (scoreData.time !== undefined) scoreData.score = scoreData.time;
      }
      
      scoreData.date = new Date().toISOString();
      scoreData.timestamp = Date.now();

      await redis.zadd(leaderboard:, {
        score: scoreData.score,
        member: JSON.stringify(scoreData)
      });

      // 只保留前 50 名 - 删除排名 50 之后的所有数据
      const count = await redis.zcard(leaderboard:);
      if (count > 50) {
        await redis.zremrangebyrank(leaderboard:, 50, -1);
      }

      const leaderboard = await redis.zrange(leaderboard:, 0, 49);
      console.log('After save ZRange:', leaderboard);
      const data = leaderboard ? leaderboard.map(item => typeof item === 'string' ? JSON.parse(item) : item) : [];

      return new Response(JSON.stringify({ success: true, leaderboard: data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else if (req.method === 'DELETE') {
      if (game === 'all') {
        const keys = await redis.keys('leaderboard:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return new Response(JSON.stringify({ success: true, leaderboard: {} }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        await redis.del(leaderboard:);
        return new Response(JSON.stringify({ success: true, leaderboard: [] }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } else if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: '不支持的请求方法' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('排行榜 API 错误:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}