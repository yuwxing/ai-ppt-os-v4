/**
 * 讯飞智能PPT API — Cloudflare Workers / Pages Functions 兼容版
 *
 * 由原 Node.js 版 ppt-api.js 适配而来，用于 frontend/functions/api 后端路由。
 *  - 签名算法保持一致: HMAC-SHA1( MD5(appId + timestamp), secret ) → base64
 *  - 用 node:crypto（需 wrangler.toml 开启 nodejs_compat）替代原 Node 模块
 *  - 用 fetch 替代 node:https
 *  - 密钥从 Cloudflare 环境变量读取（XFYUN_APP_ID / XFYUN_SECRET），不硬编码
 *
 * 对应原版文件: engine/xfyun-ppt/ppt-api.js（Node.js 本地脚本版，保持不变）
 */

import crypto from 'node:crypto';

const BASE_URL = 'zwapi.xfyun.cn';

/**
 * 从 Cloudflare env 读取讯飞凭证
 */
function getCredentials(env) {
  const appId = env?.XFYUN_APP_ID || '';
  const secret = env?.XFYUN_SECRET || '';
  if (!appId || !secret) {
    const err = new Error('讯飞凭证未配置：请在 Cloudflare Dashboard → ppt-master 项目 → Settings → Environment Variables 设置 XFYUN_APP_ID 和 XFYUN_SECRET；本地开发请在 frontend/.dev.vars 中配置');
    err.code = 'NO_CREDENTIALS';
    throw err;
  }
  return { appId, secret };
}

/**
 * 生成签名（与讯飞官方文档一致）
 *   auth = MD5(appId + timestamp)  → hex
 *   signature = HMAC-SHA1(auth, secret) → base64
 */
function getSignature(appId, secret, timestamp) {
  const auth = crypto.createHash('md5').update(appId + timestamp).digest('hex');
  return crypto.createHmac('sha1', secret).update(auth).digest('base64');
}

function getAuthHeaders(appId, secret, contentType = 'application/json') {
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    'appId': appId,
    'timestamp': String(timestamp),
    'signature': getSignature(appId, secret, timestamp),
    'Content-Type': contentType
  };
}

/**
 * 构建 multipart/form-data 请求体
 */
function buildMultipartBody(fields) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    }
  }
  body += `--${boundary}--\r\n`;
  return { boundary, body };
}

/**
 * 创建PPT任务（根据主题）
 * @param {object} env Cloudflare 环境变量
 * @param {string} query PPT主题
 * @param {object} options { templateId, author, isCardNote, aiImage, isFigure, search, language }
 * @returns {Promise<object>} { flag, data: { sid, title, subTitle }, ... }
 */
export async function createPPT(env, query, options = {}) {
  const { appId, secret } = getCredentials(env);
  const formData = buildMultipartBody({
    query: query,
    templateId: options.templateId || '',
    author: options.author || '',
    isCardNote: String(options.isCardNote !== false),
    aiImage: options.aiImage || 'standard',
    isFigure: String(options.isFigure !== false),
    search: String(options.search !== false),
    language: options.language || 'cn'
  });

  const headers = getAuthHeaders(appId, secret, `multipart/form-data; boundary=${formData.boundary}`);

  const resp = await fetch(`https://${BASE_URL}/api/ppt/v2/create`, {
    method: 'POST',
    headers,
    body: formData.body
  });

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { flag: false, desc: text || `HTTP ${resp.status}` };
  }
}

/**
 * 生成大纲（不生成完整PPT）
 */
export async function createOutline(env, query, options = {}) {
  const { appId, secret } = getCredentials(env);
  // 官方文档: /api/ppt/v2/createOutline 要求 multipart/form-data
  const formData = buildMultipartBody({
    query: query,
    businessId: options.businessId || '',
    language: options.language || 'cn',
    search: String(options.search || false)
  });
  const headers = getAuthHeaders(appId, secret, `multipart/form-data; boundary=${formData.boundary}`);

  const resp = await fetch(`https://${BASE_URL}/api/ppt/v2/createOutline`, {
    method: 'POST',
    headers,
    body: formData.body
  });

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { flag: false, desc: text || `HTTP ${resp.status}` };
  }
}

/**
 * 查询PPT生成进度
 * @param {object} env Cloudflare 环境变量
 * @param {string} sid 任务ID
 * @returns {Promise<object>} { flag, data: { pptStatus, donePages, totalPages, pptUrl, errMsg } }
 */
export async function getProgress(env, sid) {
  const { appId, secret } = getCredentials(env);
  const headers = getAuthHeaders(appId, secret);

  const resp = await fetch(`https://${BASE_URL}/api/ppt/v2/progress?sid=${encodeURIComponent(sid)}`, {
    method: 'GET',
    headers
  });

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { flag: false, desc: text || `HTTP ${resp.status}` };
  }
}

/**
 * 获取模板列表
 */
export async function getTemplates(env, options = {}) {
  const { appId, secret } = getCredentials(env);
  const headers = getAuthHeaders(appId, secret);
  const body = JSON.stringify({
    style: options.style || '',
    color: options.color || '',
    industry: options.industry || '',
    pageNum: options.pageNum || 1,
    pageSize: options.pageSize || 10
  });

  const resp = await fetch(`https://${BASE_URL}/api/ppt/v2/template/list`, {
    method: 'POST',
    headers,
    body
  });

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { flag: false, desc: text || `HTTP ${resp.status}` };
  }
}
