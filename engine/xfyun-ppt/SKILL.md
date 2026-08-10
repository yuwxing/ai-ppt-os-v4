---
name: xfyun-ppt-generator
description: 使用讯飞开放平台API一键生成PPT。当用户想要生成PPT、制作演示文稿、根据主题自动创建幻灯片时使用。支持AI配图、联网搜索增强内容、自动生成演讲备注。Use when the user wants to generate PPT, create presentation slides, or asks about 讯飞PPT、AI生成PPT、自动制作幻灯片.
---

# 讯飞智能PPT生成器

通过讯飞开放平台API，根据主题自动生成带AI配图和演讲备注的PPT，并自动下载到本地。

## 前置要求

需要 Node.js v14.0+。整个生成流程高峰期需要等待5分钟以上，调用该skill时请控制好你的执行时间不能太短

## 凭证配置

优先级：环境变量 > 本地配置文件。

### 方式一：本地配置文件（推荐）

编辑同目录下的 `xfyun.config.json`：

```json
{
  "appId": "你的AppID",
  "secret": "你的Secret",
  "baseUrl": "zwapi.xfyun.cn"
}
```

### 方式二：环境变量

```bash
# Windows PowerShell
$env:XFYUN_APP_ID="你的AppID"
$env:XFYUN_SECRET="你的Secret"

# macOS/Linux
export XFYUN_APP_ID="你的AppID"
export XFYUN_SECRET="你的Secret"
```

## 生成PPT

核心脚本路径：`ppt-generator.js`

```bash
node /path/to/zw-ppt/ppt-generator.js <主题描述>
```

生成完成后会自动下载PPT文件到当前工作目录，文件名格式：`<主题>_<时间戳>.pptx`

示例：

```bash
node ppt-generator.js 人工智能发展趋势
node ppt-generator.js 2024年度工作总结
```

## 高级用法

`ppt-api.js` 提供完整API封装，支持更多选项：

```bash
node ppt-api.js create 人工智能发展趋势
node ppt-api.js outline 人工智能发展趋势
node ppt-api.js templates
```

## 文件说明

- `config.js` - 统一加载环境变量和本地配置文件
- `xfyun.config.json` - 本地凭证配置文件
- `ppt-generator.js` - 核心生成脚本
- `ppt-api.js` - API封装类
- `README.md` - 详细说明
