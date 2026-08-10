# 讯飞智能PPT生成 - Claude Code Skill

基于讯飞开放平台API的PPT生成技能，可在Claude Code中通过 `/ppt` 命令快速生成PPT。

## 功能特性

- 根据主题自动生成PPT
- 支持AI配图
- 支持联网搜索增强内容
- 自动生成演讲备注
- 支持环境变量或本地配置文件读取凭证

## 文件说明

```
zw-ppt/
├── config.js                 # 读取环境变量 / 本地配置文件
├── xfyun.config.json         # 本地凭证配置文件
├── ppt-generator.js          # 核心生成脚本
├── ppt.md                    # Skill定义文件（需复制到用户目录）
└── README.md                 # 本文档
```

## 安装步骤

### 1. 获取讯飞API密钥

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 注册并登录账号
3. 创建应用，开通「智能PPT生成」服务
4. 获取 `APP_ID` 和 `API Secret`

### 2. 放置脚本文件

将整个 `zw-ppt` 目录放到固定位置，例如：
- Windows: `D:/skill/zw-ppt/`
- macOS/Linux: `~/skill/zw-ppt/`

### 3. 安装 Skill 定义文件

将 `ppt.md` 复制到 Claude Code 用户命令目录：

**Windows:**
```
C:\Users\<用户名>\.claude\commands\ppt.md
```

**macOS/Linux:**
```
~/.claude/commands/ppt.md
```

### 4. 修改脚本路径

编辑 `ppt.md`，将路径改为你的实际路径：

```markdown
node D:/skill/zw-ppt/ppt-generator.js $ARGUMENTS
     ↑ 改成你的实际路径
```

### 5. 配置凭证

优先级：环境变量 > 本地配置文件。

**方式一：编辑本地配置文件（推荐）**

编辑 `xfyun.config.json`：

```json
{
  "appId": "你的AppID",
  "secret": "你的Secret",
  "baseUrl": "zwapi.xfyun.cn"
}
```

**方式二：配置环境变量**

**Windows PowerShell:**
```powershell
$env:XFYUN_APP_ID="你的AppID"
$env:XFYUN_SECRET="你的Secret"
```

**Windows CMD:**
```cmd
set XFYUN_APP_ID=你的AppID
set XFYUN_SECRET=你的Secret
```

**macOS/Linux:**
```bash
export XFYUN_APP_ID="你的AppID"
export XFYUN_SECRET="你的Secret"
```

### 6. 确认Node.js已安装

```bash
node --version
```

需要 Node.js 14.0 或更高版本。

## 使用方法

在任意目录启动 Claude Code，输入：

```
/ppt 人工智能发展趋势
```

等待生成完成，获取下载链接。

## 常见问题

### Q: 提示找不到凭证？
A: 优先检查 `xfyun.config.json` 是否已填写，或确认环境变量 `XFYUN_APP_ID` 和 `XFYUN_SECRET` 是否存在。

### Q: 生成超时？
A: 网络问题或讯飞服务繁忙，请稍后重试。

### Q: /ppt 命令不存在？
A: 检查 `ppt.md` 是否正确放置到 `~/.claude/commands/` 目录。

## 相关链接

- [讯飞开放平台](https://www.xfyun.cn/)
- [智能PPT API文档](https://www.xfyun.cn/doc/spark/ppt.html)
- [Claude Code](https://claude.com/claude-code)
