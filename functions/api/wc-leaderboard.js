// functions/api/wc-leaderboard.js
// 写作教练「每日打榜 TOP10」后端：真实跨用户榜单（全网 / 按班级筛选）。
// 部署：随 ppt-master 项目一起由 wrangler pages deploy 上传（本文件位于仓库根 functions/ 目录）。
// 存储：复用 wrangler.toml 中已绑定的 LESSONS_KV（key 前缀 wc:lb:），零额外基础设施。
//
// GET  /api/wc-leaderboard            -> 返回榜单（默认前 20）
//      ?class=高三(1)班&today=1&limit=10
//        class : 仅返回该班级（为空=全网）
//        today : 1 时仅返回今天（UTC）提交的条目
//        limit : 返回条数，默认 20，最大 50
// POST /api/wc-leaderboard            -> 提交一条成绩
//      body: { nickname, grade, class, title, score, total, snippet }

const INDEX_KEY = 'wc:lb:_index'
const ALLOWED_GRADES = ['初一', '初二', '初三', '高一', '高二', '高三']

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    },
  })
}

function clean(s, max) {
  if (typeof s !== 'string') return ''
  return s.replace(/[<>]/g, '').trim().slice(0, max)
}

function isToday(ts) {
  const d = new Date(ts)
  const n = new Date()
  return d.getUTCFullYear() === n.getUTCFullYear() && d.getUTCMonth() === n.getUTCMonth() && d.getUTCDate() === n.getUTCDate()
}

function clientIp(request) {
  const fwd = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
  return String(fwd).split(',')[0].trim()
}

async function getIndex(kv) {
  try {
    const raw = await kv.get(INDEX_KEY, { type: 'json' })
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export async function onRequest(context) {
  const { request, env } = context
  const kv = env.LESSONS_KV
  if (!kv) return json({ error: 'KV 未绑定' }, 500)

  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    } })
  }

  // ── GET：读取榜单 ──
  if (method === 'GET') {
    const url = new URL(request.url)
    const classFilter = clean(url.searchParams.get('class'), 24)
    const onlyToday = url.searchParams.get('today') === '1'
    let limit = parseInt(url.searchParams.get('limit') || '20', 10)
    if (!Number.isFinite(limit) || limit < 1) limit = 20
    limit = Math.min(limit, 50)

    let list = await getIndex(kv)
    if (classFilter) list = list.filter((e) => (e.class || '').toLowerCase() === classFilter.toLowerCase())
    if (onlyToday) list = list.filter((e) => isToday(e.ts))
    list.sort((a, b) => (b.score - a.score) || (b.ts - a.ts))
    const top = list.slice(0, limit).map((e, i) => ({
      rank: i + 1,
      id: e.id,
      nickname: e.nickname,
      grade: e.grade,
      class: e.class || '',
      title: e.title,
      score: e.score,
      total: e.total,
      snippet: e.snippet || '',
      ts: e.ts,
    }))
    return json({ count: list.length, returned: top.length, list: top })
  }

  // ── POST：提交成绩 ──
  if (method === 'POST') {
    let body
    try { body = await request.json() } catch { return json({ error: '请求体不是合法 JSON' }, 400) }

    const nickname = clean(body?.nickname, 20)
    const grade = ALLOWED_GRADES.includes(body?.grade) ? body?.grade : ''
    const cls = clean(body?.class, 24)
    const title = clean(body?.title, 80)
    const snippet = clean(body?.snippet, 600)
    const score = Number(body?.score)
    const total = Number(body?.total)

    if (!nickname) return json({ error: '请填写昵称（1-20 字）' }, 400)
    if (!grade) return json({ error: '年级不合法' }, 400)
    if (!title) return json({ error: '请填写题目' }, 400)
    if (!Number.isFinite(score) || score < 0 || score > 200) return json({ error: '分数不合法' }, 400)

    // 轻量防刷：每 IP 每天最多 50 条
    const day = new Date().toISOString().slice(0, 10)
    const rlKey = `wc:rl:${clientIp(request)}:${day}`
    try {
      const cnt = parseInt((await kv.get(rlKey)) || '0', 10) + 1
      await kv.put(rlKey, String(cnt), { expirationTtl: 86400 })
      if (cnt > 50) return json({ error: '今日提交次数过多，请明天再试' }, 429)
    } catch { /* 限流失败不阻断主流程 */ }

    const entry = {
      id: `lb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      nickname,
      grade,
      class: cls,
      title,
      score: Math.round(score),
      total: Number.isFinite(total) ? Math.round(total) : null,
      snippet,
      ts: Date.now(),
    }

    // 读-改-写索引（MVP 规模足够；高并发下偶发覆盖可接受）
    const list = await getIndex(kv)
    list.push(entry)
    list.sort((a, b) => (b.score - a.score) || (b.ts - a.ts))
    const trimmed = list.slice(0, 1000) // 仅保留榜单相关的最新 1000 条
    try { await kv.put(INDEX_KEY, JSON.stringify(trimmed)) } catch { return json({ error: '存储失败' }, 500) }

    return json({ ok: true, entry: { id: entry.id, rank: trimmed.findIndex((e) => e.id === entry.id) + 1 } }, 201)
  }

  return json({ error: '方法不支持' }, 405)
}
