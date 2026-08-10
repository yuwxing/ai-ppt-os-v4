/**
 * 讯飞智能PPT API 封装
 * 支持所有API功能
 *
 * ─────────────────────────────────────────────────────────
 *  凭证配置状态：已配置 ✅
 *  - appId  / secret 已写入同目录 xfyun.config.json
 *  - 本文件可在 Node.js 环境直接运行：
 *      node ppt-api.js create <主题>      生成PPT
 *      node ppt-api.js outline <主题>     只生成大纲
 *      node ppt-api.js templates [风格]   获取模板列表
 *  - 讯飞智能PPT API 仅需 appId + APISecret，不需要 APIKey
 *  - baseUrl: zwapi.xfyun.cn
 *  - 签名算法: HMAC-SHA1( MD5(appId + timestamp), secret ) → base64
 *
 *  ⚠️ 安全提醒：
 *  - xfyun.config.json 含密钥，请勿提交到公开git仓库
 *  - 生产环境建议改用环境变量 XFYUN_APP_ID / XFYUN_SECRET
 *  - 如密钥曾泄露，请到讯飞开放平台重置
 * ─────────────────────────────────────────────────────────
 */

import crypto from 'node:crypto';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { loadXfyunConfig } from './config.js';

class XfyunPPTApi {
    constructor(appId, secret) {
        const config = loadXfyunConfig();
        this.appId = appId || config.appId;
        this.secret = secret || config.secret;
        this.baseUrl = config.baseUrl;
        this.configPath = config.configPath;

        if (!this.appId || !this.secret) {
            throw new Error(`请提供 appId 和 secret，或配置环境变量 XFYUN_APP_ID / XFYUN_SECRET，或填写本地配置文件 ${this.configPath}`);
        }
    }

    _getSignature(timestamp) {
        const auth = crypto.createHash('md5').update(this.appId + timestamp).digest('hex');
        return crypto.createHmac('sha1', this.secret).update(auth).digest('base64');
    }

    _getAuthHeaders(contentType = 'application/json') {
        const timestamp = Math.floor(Date.now() / 1000);
        return {
            'appId': this.appId,
            'timestamp': String(timestamp),
            'signature': this._getSignature(timestamp),
            'Content-Type': contentType
        };
    }

    _buildMultipartBody(fields) {
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

    _request(options, postData = null) {
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
            if (postData) {
                req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
            }
            req.end();
        });
    }

    async getTemplates(options = {}) {
        const headers = this._getAuthHeaders();
        const body = JSON.stringify({
            style: options.style || '',
            color: options.color || '',
            industry: options.industry || '',
            pageNum: options.pageNum || 1,
            pageSize: options.pageSize || 10
        });

        const reqOptions = {
            hostname: this.baseUrl,
            port: 443,
            path: '/api/ppt/v2/template/list',
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }
        };

        return this._request(reqOptions, body);
    }

    async createByQuery(query, options = {}) {
        const formData = this._buildMultipartBody({
            query: query,
            templateId: options.templateId || '',
            author: options.author || '',
            isCardNote: String(options.isCardNote !== false),
            aiImage: options.aiImage || 'standard',
            isFigure: String(options.isFigure !== false),
            search: String(options.search !== false),
            language: options.language || 'cn'
        });
        const headers = this._getAuthHeaders(`multipart/form-data; boundary=${formData.boundary}`);

        const reqOptions = {
            hostname: this.baseUrl,
            port: 443,
            path: '/api/ppt/v2/create',
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(formData.body) }
        };

        return this._request(reqOptions, formData.body);
    }

    async createByFile(filePath, options = {}) {
        console.log('文件上传功能需要额外依赖，建议使用 createByQuery');
        throw new Error('文件上传暂未实现，请使用 createByQuery');
    }

    async createOutline(query, options = {}) {
        // 官方文档: /api/ppt/v2/createOutline 要求 multipart/form-data
        const formData = this._buildMultipartBody({
            query: query,
            businessId: options.businessId || '',
            language: options.language || 'cn',
            search: String(options.search || false)
        });
        const headers = this._getAuthHeaders(`multipart/form-data; boundary=${formData.boundary}`);

        const reqOptions = {
            hostname: this.baseUrl,
            port: 443,
            path: '/api/ppt/v2/createOutline',
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(formData.body) }
        };

        return this._request(reqOptions, formData.body);
    }

    async createByOutline(outline, options = {}) {
        const headers = this._getAuthHeaders();
        const body = JSON.stringify({
            outline: outline,
            templateId: options.templateId || '',
            author: options.author || '',
            isCardNote: options.isCardNote !== false,
            aiImage: options.aiImage || 'standard',
            isFigure: options.isFigure !== false,
            search: options.search !== false,
            language: options.language || 'cn',
            query: options.query || ''
        });

        const reqOptions = {
            hostname: this.baseUrl,
            port: 443,
            path: '/api/ppt/v2/createPptByOutline',
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }
        };

        return this._request(reqOptions, body);
    }

    async getProgress(sid) {
        const headers = this._getAuthHeaders();

        const reqOptions = {
            hostname: this.baseUrl,
            port: 443,
            path: `/api/ppt/v2/progress?sid=${sid}`,
            method: 'GET',
            headers: headers
        };

        return this._request(reqOptions);
    }

    async waitForCompletion(sid, options = {}) {
        const maxWaitTime = options.maxWaitTime || 300000;
        const pollInterval = options.pollInterval || 3000;
        const onProgress = options.onProgress || null;
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            const result = await this.getProgress(sid);

            if (!result.flag) {
                throw new Error(`查询进度失败: ${result.desc || `HTTP ${result.httpStatus || 'unknown'}`}`);
            }

            const data = result.data;

            if (onProgress) {
                onProgress(data);
            }

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

    async generate(query, options = {}) {
        const createResult = await this.createByQuery(query, options);

        if (!createResult.flag) {
            throw new Error(`创建失败: ${createResult.desc || `HTTP ${createResult.httpStatus || 'unknown'}`}`);
        }

        const sid = createResult.data.sid;
        const result = await this.waitForCompletion(sid, {
            onProgress: (data) => {
                if (options.verbose) {
                    console.log(`进度: ${data.donePages || 0}/${data.totalPages || '?'} 页`);
                }
            }
        });

        return {
            sid: sid,
            title: createResult.data.title,
            subTitle: createResult.data.subTitle,
            pptUrl: result.pptUrl,
            totalPages: result.totalPages
        };
    }
}

export default XfyunPPTApi;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const command = args[0];

    const api = new XfyunPPTApi();

    async function main() {
        switch (command) {
            case 'templates': {
                const templates = await api.getTemplates({
                    style: args[1] || '',
                    pageSize: 5
                });
                console.log(JSON.stringify(templates, null, 2));
                break;
            }

            case 'outline': {
                const outline = await api.createOutline(args.slice(1).join(' '));
                console.log(JSON.stringify(outline, null, 2));
                break;
            }

            case 'create':
            default: {
                const query = (command === 'create' ? args.slice(1) : args).join(' ');
                if (!query) {
                    console.log('用法:');
                    console.log('  node ppt-api.js create <主题>  - 生成PPT');
                    console.log('  node ppt-api.js outline <主题> - 只生成大纲');
                    console.log('  node ppt-api.js templates [风格] - 获取模板列表');
                    process.exit(1);
                }

                console.log(`正在生成PPT: "${query}"`);
                const result = await api.generate(query, { verbose: true });
                console.log('\n========== 完成 ==========');
                console.log(`标题: ${result.title}`);
                console.log(`页数: ${result.totalPages}`);
                console.log(`下载: ${result.pptUrl}`);
                break;
            }
        }
    }

    main().catch(err => {
        console.error('错误:', err.message);
        process.exit(1);
    });
}
