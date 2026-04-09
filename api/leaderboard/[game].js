// Vercel Serverless Function for Leaderboard
// 使用 Vercel KV (基于 Upstash Redis)

import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

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
    if (req.method === 'GET') {
      // 获取排行榜
      const leaderboard = await kv.zrange(`leaderboard:${game}`, 0, -1, { rev: true });
      const data = leaderboard.map(item => JSON.parse(item));
      
      return new Response(JSON.stringify({ success: true, leaderboard: data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else if (req.method === 'POST') {
      // 保存分数
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

      // 标准化数据
      const scoreData = { ...body };
      if (scoreData.score === undefined) {
        if (scoreData.moves !== undefined) scoreData.score = scoreData.moves;
        else if (scoreData.time !== undefined) scoreData.score = scoreData.time;
      }
      
      scoreData.date = new Date().toISOString();
      scoreData.timestamp = Date.now();

      // 添加到有序集合
      await kv.zadd(`leaderboard:${game}`, {
        score: scoreData.score,
        member: JSON.stringify(scoreData)
      });

      // 只保留前 50 名
      await kv.zremrangebyrank(`leaderboard:${game}`, 0, -51);

      // 获取最新排行榜
      const leaderboard = await kv.zrange(`leaderboard:${game}`, 0, -1, { rev: true });
      const data = leaderboard.map(item => JSON.parse(item));

      return new Response(JSON.stringify({ success: true, leaderboard: data }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else if (req.method === 'DELETE') {
      // 清空排行榜
      if (game === 'all') {
        const keys = await kv.keys('leaderboard:*');
        if (keys.length > 0) {
          await kv.del(...keys);
        }
        return new Response(JSON.stringify({ success: true, leaderboard: {} }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        await kv.del(`leaderboard:${game}`);
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
