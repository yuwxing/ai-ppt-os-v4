/**
 * 讯飞PPT鉴权诊断脚本
 * 打印签名中间值 + 完整HTTP响应（状态码/响应头/响应体）
 * 用于精确定位 "Invalid AppId" 的真实原因
 */
import crypto from 'node:crypto';
import https from 'node:https';

const APP_ID = process.env.XFYUN_APP_ID || '7c8babc9';
const SECRET = process.env.XFYUN_SECRET || 'MTYxYTI1Y2Q3NTQ2ZjYzZTEyYjdiMmVi';
const BASE = 'zwapi.xfyun.cn';

function sign(appId, secret, ts) {
  const auth = crypto.createHash('md5').update(appId + ts).digest('hex');
  const sig = crypto.createHmac('sha1', secret).update(auth).digest('base64');
  return { auth, sig };
}

function rawRequest(method, path, headers, body) {
  return new Promise((resolve) => {
    const opts = { hostname: BASE, port: 443, path, method, headers };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const ts = Math.floor(Date.now() / 1000);
  const { auth, sig } = sign(APP_ID, SECRET, ts);

  console.log('========== 鉴权诊断 ==========');
  console.log('appId     :', APP_ID);
  console.log('secret    :', SECRET);
  console.log('secret长度 :', SECRET.length);
  console.log('timestamp :', ts, '(秒)');
  console.log('本地时间   :', new Date().toISOString());
  console.log('md5(auth) :', auth);
  console.log('signature :', sig);
  console.log('');

  const authHeaders = {
    appId: APP_ID,
    timestamp: String(ts),
    signature: sig,
  };

  // 测试1: template/list (application/json, 最简单的端点)
  console.log('========== 测试1: POST /api/ppt/v2/template/list ==========');
  const body1 = JSON.stringify({ style: '', color: '', industry: '', pageNum: 1, pageSize: 5 });
  const h1 = { ...authHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body1) };
  const r1 = await rawRequest('POST', '/api/ppt/v2/template/list', h1, body1);
  console.log('HTTP状态  :', r1.status);
  console.log('响应头    :', JSON.stringify(r1.headers, null, 2));
  console.log('响应体    :', r1.body);
  console.log('');

  // 测试2: createOutline (官方文档要求 multipart/form-data)
  console.log('========== 测试2: POST /api/ppt/v2/createOutline (multipart) ==========');
  const boundary = '----diag' + Math.random().toString(36).slice(2);
  let mb = '';
  for (const [k, v] of [['query', '人工智能入门'], ['language', 'cn']]) {
    mb += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  }
  mb += `--${boundary}--\r\n`;
  const h2 = { ...authHeaders, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': Buffer.byteLength(mb) };
  const r2 = await rawRequest('POST', '/api/ppt/v2/createOutline', h2, mb);
  console.log('HTTP状态  :', r2.status);
  console.log('响应体    :', r2.body);
  console.log('');

  // 测试3: 旧版端点 create (application/json) 对照
  console.log('========== 测试3: POST /api/aippt/create (旧版对照) ==========');
  const body3 = JSON.stringify({ query: '人工智能入门', create_model: 'auto' });
  const h3 = { ...authHeaders, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body3) };
  const r3 = await rawRequest('POST', '/api/aippt/create', h3, body3);
  console.log('HTTP状态  :', r3.status);
  console.log('响应体    :', r3.body);
  console.log('');

  // 测试4: 故意用错误的signature，看错误是否不同（判断是否真的在校验签名）
  console.log('========== 测试4: 故意错误signature (验证服务端是否校验签名) ==========');
  const h4 = { ...authHeaders, signature: 'AAAAinvalid_signature_test====', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body1) };
  const r4 = await rawRequest('POST', '/api/ppt/v2/template/list', h4, body1);
  console.log('HTTP状态  :', r4.status);
  console.log('响应体    :', r4.body);
  console.log('');

  // 测试5: 不带任何鉴权头
  console.log('========== 测试5: 不带鉴权头 (对照基线) ==========');
  const h5 = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body1) };
  const r5 = await rawRequest('POST', '/api/ppt/v2/template/list', h5, body1);
  console.log('HTTP状态  :', r5.status);
  console.log('响应体    :', r5.body);
}

main().catch((e) => console.error('脚本异常:', e));
