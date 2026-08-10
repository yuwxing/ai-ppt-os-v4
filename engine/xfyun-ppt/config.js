import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, 'xfyun.config.json');

function loadLocalConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return {};
        }

        const raw = fs.readFileSync(CONFIG_PATH, 'utf8').replace(/^\uFEFF/, '').trim();
        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        throw new Error(`读取本地配置文件失败: ${error.message}`);
    }
}

export function loadXfyunConfig() {
    const localConfig = loadLocalConfig();

    return {
        appId: process.env.XFYUN_APP_ID || localConfig.appId || '',
        secret: process.env.XFYUN_SECRET || localConfig.secret || '',
        baseUrl: process.env.XFYUN_BASE_URL || localConfig.baseUrl || 'zwapi.xfyun.cn',
        configPath: CONFIG_PATH
    };
}
