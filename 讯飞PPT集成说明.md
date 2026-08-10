# 讯飞智能PPT生成 — 集成说明

## 概述

已将「讯飞智能PPT生成 Skill」集成到 `/prep/generate` 页面。在原有的 DeepSeek AI 备课流程之外，新增「讯飞一键生成PPT」入口：输入课题 → 讯飞API自动生成完整 .pptx 文件 → 直接下载。

两种生成方式并存：
| | DeepSeek AI备课（原有） | 讯飞智能PPT（新增） |
|---|---|---|
| 触发按钮 | 开始AI备课（紫色） | 讯飞生成PPT（橙色） |
| 生成内容 | 教案+游戏+作业+主题升华（结构化） | 完整PPT文件（含AI配图+演讲备注） |
| 输出格式 | 本地组装 .pptx + 在线预览编辑 | 讯飞返回 .pptx 下载链接 |
| 耗时 | 约30秒 | 1-5分钟 |
| 适用场景 | 需要教学设计、教案、分层作业 | 快速生成完整PPT演示文稿 |

---

## 改动文件清单

### 新增文件
| 文件 | 说明 |
|------|------|
| `engine/xfyun-ppt/` | 讯飞skill原版文件（Node.js本地脚本，含config.js/ppt-api.js/ppt-generator.js/SKILL.md/README.md/package.json） |
| `frontend/functions/api/lib/xfyun.js` | **Workers兼容讯飞API模块**（签名+请求，用node:crypto+fetch） |
| `.dev.vars` | Cloudflare Pages本地开发密钥配置（已填入，**勿提交git**） |
| `.gitignore` | 新建，忽略密钥文件和构建产物 |
| `讯飞PPT集成说明.md` | 本文档 |

### 修改文件
| 文件 | 改动内容 |
|------|----------|
| `xfyun-ppt-generator-20260411.051730/xfyun.config.json` | 填入 appId + secret（原版skill鉴权配置） |
| `xfyun-ppt-generator-20260411.051730/ppt-api.js` | 顶部添加配置状态说明注释 |
| `wrangler.toml` | 添加 `compatibility_flags = ["nodejs_compat"]`（讯飞签名需要node:crypto） |
| `frontend/functions/api/[[catchall]].js` | 顶部导入xfyun模块；新增4个讯飞API路由 |
| `frontend/src/api/ai.js` | 新增 `xfyunCreatePPT()` 和 `xfyunGetProgress()` 函数 |
| `frontend/src/pages/GeneratePage.jsx` | 新增讯飞状态/处理函数/按钮/进度面板/结果面板 |

---

## 密钥配置

讯飞PPT API鉴权只需 **APPID + APISecret**（不需要APIKey）。
- APPID: `7c8babc9`
- APISecret: `MTYxYTI1Y2Q3NTQ2ZjYzZTEyYjdiMmVi`

### 本地开发

密钥已写入 `.dev.vars`（项目根目录），`wrangler pages dev` 会自动读取：
```
XFYUN_APP_ID=7c8babc9
XFYUN_SECRET=MTYxYTI1Y2Q3NTQ2ZjYzZTEyYjdiMmVi
```

### 生产部署（Cloudflare Pages）

在 Cloudflare Dashboard 配置环境变量：
1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → `ppt-master` 项目
2. Settings → Environment Variables
3. 添加两个变量：
   - `XFYUN_APP_ID` = `7c8babc9`
   - `XFYUN_SECRET` = `MTYxYTI1Y2Q3NTQ2ZjYzZTEyYjdiMmVi`
4. 重新部署

### 原版skill本地脚本

原版 Node.js 脚本（`engine/xfyun-ppt/ppt-generator.js`）的密钥已配置在原skill目录的 `xfyun.config.json` 中，可直接运行：
```bash
node engine/xfyun-ppt/ppt-generator.js "光合作用"
```

---

## 启动与测试

### 本地开发

```bash
cd D:/ai-ppt-os-v3/frontend
npx wrangler pages dev dist --local-protocol=http
```

然后访问 `http://localhost:8788/prep/generate`，输入课题，点击橙色「讯飞生成PPT」按钮。

### 验证API

```bash
# 健康检查
curl http://localhost:8788/api/health

# 测试讯飞创建（需要本地密钥配置）
curl -X POST http://localhost:8788/api/xfyun/create \
  -H "Content-Type: application/json" \
  -d '{"query":"光合作用"}'

# 查询进度（用上一步返回的sid）
curl "http://localhost:8788/api/xfyun/progress?sid=xxxx"
```

---

## API接口说明

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/xfyun/create` | 创建PPT任务。Body: `{query, templateId?, aiImage?, language?}` → 返回 `{ok, sid, title}` |
| GET | `/api/xfyun/progress?sid=xxx` | 查询进度 → `{ok, pptStatus, donePages, totalPages, pptUrl, errMsg}` |
| POST | `/api/xfyun/outline` | 只生成大纲。Body: `{query}` → `{ok, data}` |
| GET | `/api/xfyun/templates` | 获取模板列表。Query: `?style=&pageSize=` |

讯飞原始API基础地址：`https://zwapi.xfyun.cn`
签名算法：`HMAC-SHA1(MD5(appId+timestamp), secret) → base64`

---

## 架构说明

```
用户浏览器 (/prep/generate)
    │
    ├── [开始AI备课] → POST /api/generate → DeepSeek → pptx.js组装 → 下载
    │                     (原有流程，不变)
    │
    └── [讯飞生成PPT] → POST /api/xfyun/create ──┐
                        ← {sid}                    │
                        轮询 GET /api/xfyun/progress?sid=xxx
                        ← {pptStatus, pptUrl}      │
                                                   ▼
                                    frontend/functions/api/lib/xfyun.js
                                    (Workers兼容模块，node:crypto签名)
                                                   │
                                                   ▼
                                    https://zwapi.xfyun.cn/api/ppt/v2/*
                                    (讯飞开放平台API)
```

---

## 安全注意事项

1. **密钥不暴露前端**：讯飞密钥只在 Cloudflare Workers 服务端使用，前端不接触密钥
2. **.gitignore 已配置**：`.dev.vars`、`.env`、`xfyun.config.json` 均被忽略，不会提交到git
3. **密钥曾出现在对话中**：建议到[讯飞开放平台](https://www.xfyun.cn/)重置APISecret以防泄露
4. **nodejs_compat**：wrangler.toml 已开启，仅影响新增的 node:crypto 调用，不改变现有功能行为

---

## 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| "讯飞凭证未配置" | 环境变量未设置 | 检查 `.dev.vars`（本地）或 Cloudflare环境变量（生产） |
| "讯飞创建失败" | 鉴权失败或服务未开通 | 确认 APPID/APISecret 正确，且已开通智能PPT服务 |
| 生成超时 | 讯飞服务繁忙 | 高峰期需5分钟以上，前端轮询间隔3秒，最多等待约10分钟 |
| 进度一直0页 | 讯飞排队中 | 正常现象，排队完成后会快速生成 |
| node:crypto 报错 | nodejs_compat 未生效 | 确认 wrangler.toml 有 `compatibility_flags = ["nodejs_compat"]`，重新部署 |
