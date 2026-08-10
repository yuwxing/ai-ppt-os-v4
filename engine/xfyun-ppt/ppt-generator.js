/**
 * 讯飞智能PPT生成器
 * 使用讯飞开放平台API生成PPT
 */

import crypto from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXfyunConfig } from './config.js';

// 配置
const CONFIG = loadXfyunConfig();

/**
 * 生成签名
 */
function getSignature(appId, secret, timestamp) {
    const auth = crypto.createHash('md5').update(appId + timestamp).digest('hex');
    return crypto.createHmac('sha1', secret).update(auth).digest('base64');
}

/**
 * 获取认证头
 */
function getAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    return {
        'appId': CONFIG.appId,
        'timestamp': String(timestamp),
        'signature': getSignature(CONFIG.appId, CONFIG.secret, timestamp)
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
 * 发送HTTPS请求
 */
function request(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const payload = typeof data === 'string' ? data.trim() : data;
                try {
                    const parsed = JSON.parse(payload);
                    if (res.statusCode >= 400 && parsed && typeof parsed === 'object') {
                        parsed.httpStatus = res.statusCode;
                    }
                    resolve(parsed);
                } catch (e) {
                    resolve({
                        flag: false,
                        httpStatus: res.statusCode,
                        desc: payload || `HTTP ${res.statusCode}`
                    });
                }
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

/**
 * 创建PPT (根据主题)
 */
async function createPPT(query, options = {}) {
    const authHeaders = getAuthHeaders();

    const formData = buildMultipartBody({
        query: query,
        language: options.language || 'cn',
        isCardNote: String(options.isCardNote !== false),
        aiImage: options.aiImage || 'standard',
        isFigure: String(options.isFigure !== false),
        search: String(options.search !== false),
        author: options.author || '',
        templateId: options.templateId || ''
    });

    const reqOptions = {
        hostname: CONFIG.baseUrl,
        port: 443,
        path: '/api/ppt/v2/create',
        method: 'POST',
        headers: {
            ...authHeaders,
            'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
            'Content-Length': Buffer.byteLength(formData.body)
        }
    };

    return request(reqOptions, formData.body);
}

/**
 * 查询PPT生成进度
 */
async function getProgress(sid) {
    const authHeaders = getAuthHeaders();

    const reqOptions = {
        hostname: CONFIG.baseUrl,
        port: 443,
        path: `/api/ppt/v2/progress?sid=${sid}`,
        method: 'GET',
        headers: authHeaders
    };

    return request(reqOptions);
}

/**
 * 下载文件到本地
 */
async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const file = fs.createWriteStream(outputPath);

        protocol.get(url, (response) => {
            // 处理重定向
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                fs.unlinkSync(outputPath);
                return downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(outputPath);
                reject(new Error(`下载失败: HTTP ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve(outputPath);
            });

            file.on('error', (err) => {
                fs.unlinkSync(outputPath);
                reject(err);
            });
        }).on('error', (err) => {
            file.close();
            fs.unlinkSync(outputPath);
            reject(err);
        });
    });
}

/**
 * 等待PPT生成完成
 */
async function waitForCompletion(sid, maxWaitTime = 300000) {
    const startTime = Date.now();
    const pollInterval = 3000;

    while (Date.now() - startTime < maxWaitTime) {
        const result = await getProgress(sid);

        if (!result.flag) {
            throw new Error(`查询进度失败: ${result.desc || `HTTP ${result.httpStatus || 'unknown'}`}`);
        }

        const data = result.data;
        console.log(`进度: ${data.donePages || 0}/${data.totalPages || '?'} 页, 状态: ${data.pptStatus}`);

        if (data.pptStatus === 'done') {
            return data;
        }

        if (data.pptStatus === 'error') {
            throw new Error(`PPT生成失败: ${data.errMsg}`);
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('PPT生成超时');
}

/**
 * 主函数
 */
async function main() {
    if (!CONFIG.appId || !CONFIG.secret) {
        console.error('错误: 未找到讯飞凭证');
        console.error('');
        console.error('请使用以下任一方式配置:');
        console.error('1. 环境变量 XFYUN_APP_ID / XFYUN_SECRET');
        console.error(`2. 编辑本地配置文件: ${CONFIG.configPath}`);
        process.exit(1);
    }

    const query = process.argv.slice(2).join(' ');
    if (!query) {
        console.error('错误: 请提供PPT主题');
        console.error('用法: node ppt-generator.js <主题描述>');
        console.error('示例: node ppt-generator.js 人工智能发展趋势');
        process.exit(1);
    }

    console.log(`\n开始生成PPT: "${query}"\n`);

    try {
        console.log('正在创建PPT任务...');
        const createResult = await createPPT(query);

        if (!createResult.flag) {
            throw new Error(`创建失败: ${createResult.desc || `HTTP ${createResult.httpStatus || 'unknown'}`}`);
        }

        const sid = createResult.data.sid;
        console.log(`任务创建成功, SID: ${sid}`);
        console.log(`标题: ${createResult.data.title}`);
        console.log(`副标题: ${createResult.data.subTitle || '无'}`);
        console.log('');

        console.log('正在生成PPT，请稍候...');
        const result = await waitForCompletion(sid);

        console.log('\n========== PPT生成完成 ==========');
        console.log(`总页数: ${result.totalPages}`);
        console.log(`下载链接: ${result.pptUrl}`);
        console.log('================================\n');

        // 下载PPT到本地
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const safeQuery = query.replace(/[\\/:*?"<>|]/g, '_').slice(0, 50);
        const filename = `${safeQuery}_${timestamp}.pptx`;
        const outputDir = process.cwd();
        const outputPath = path.join(outputDir, filename);

        console.log('正在下载PPT到本地...');
        try {
            await downloadFile(result.pptUrl, outputPath);
            console.log(`\n========== 下载完成 ==========`);
            console.log(`本地文件: ${outputPath}`);
            console.log('==============================\n');
        } catch (downloadError) {
            console.error(`下载失败: ${downloadError.message}`);
            console.log('您可以手动通过上方链接下载PPT');
        }

        return result.pptUrl;
    } catch (error) {
        console.error(`\n错误: ${error.message}`);
        process.exit(1);
    }
}

export {
    createPPT,
    getProgress,
    waitForCompletion,
    getSignature,
    downloadFile
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
