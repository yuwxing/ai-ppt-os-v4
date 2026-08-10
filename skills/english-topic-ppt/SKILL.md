---
name: 英语话题课件制作（初中）
description: 把任意英语话题（如购物、食物、运动、旅行、节日）按"初中英语话题课件"标准 SOP 制作成一份完整 PPT。当用户要制作英语教学课件 / 英语单元 PPT / 话题复习课件，或提到"用课件流程做 PPT""按英语话题课件技能""英语话题课件"时使用。基于一份真实的 28 页初中英语"购物"课件提炼出 15 步标准流程：封面→学习目标→话题导入→词汇(Task1)→脑暴→跟读→文化热点→对话补全(Task2)→功能表达→角色扮演(Task3)→中考听力实战→技巧秘籍→情感升华→作业→致谢。成品全程图文并茂、中英双语、任务标签化，含配图占位框与计时器占位；并支持真实图片/视频/音频嵌入与 Fade 入场动画（由 PowerPoint COM 后处理）。
---

# 英语话题课件制作技能（初中）

把**一个英语话题**变成一份结构完整、可直接上课的初中英语课件 PPT（.pptx）。
流程提炼自一份真实的 28 页"Shopping / 购物"课件，是初中英语话题课的通用套路。

## 何时使用
- 「帮我做一份英语食物课件」「按课件流程生成一份运动 PPT」
- 「用英语话题课件技能做一份旅行 PPT」
- 任何需要"初中英语 + 某个生活/单元话题 + 成体系课件"的场景

## 总体做法（3 步）
1. **定话题与学段**：明确话题（英文+中文，如 Shopping/购物）、学段（默认初中）、作者署名。
2. **按 SOP 展开内容**：用下方 15 步流程，把该话题填充成结构化内容（词汇、对话、表达、中考题等）。
3. **生成 PPT**：
   - 先用 `scripts/build_template.ps1`（仅需一次）构建母版 `template.pptx`；
   - 再把内容组织成 `examples/shopping.json` 同款 JSON；
   - 运行 `scripts/build_pptx.py --json <json> --out <.pptx>` 生成 .pptx；
   - 运行 `scripts/postprocess_anim.ps1 -pptx <.pptx>` 添加 Fade 入场动画与“点击出答案”。

---

## 一、标准流程 SOP（15 个模块，必须按顺序）

| # | 模块 | 作用 | 关键内容 |
|---|------|------|----------|
| 1 | 封面 | 点题 | 大标题（话题英文口号，如 "Let's go shopping！"）+ 作者署名 |
| 2 | 学习目标 | 明示目标 | 2-3 条：掌握话题表达 / 听力技巧 / 文化意识 |
| 3 | 话题导入 | 热身 | 1-2 个趣味问题 + 一句引导语 |
| 4 | Task 1 · 词汇 | 核心名词 | 6 个话题核心词（中英），每词配图 |
| 5 | Brain storm | 词汇网 | 围绕核心词的拓展词（近/反义、相关词性） |
| 6 | Let's read | 跟读/填空 | 英汉互译填空（中文留空填英文或反之） |
| 7 | 文化热点 | 生活链接 | 该话题在真实生活中的热点（如购物→双十一） |
| 8 | Task 2 · 对话补全 | 语用 | 情景对话挖空（疑问词/价格/尺寸/颜色）+ Tips |
| 9 | 功能表达 | 句型归纳 | 交际双方常用语（如店员 / 顾客两类） |
| 10 | Task 3 · 角色扮演 | 输出 | 2-3 个情景任务 + **限时**（计时器占位） |
| 11 | 直击中考·听力实战 | 应试 | 1-3 组中考试题（题干+三选项+原文+巧记技巧） |
| 12 | 技巧秘籍 | 方法总结 | 该话题答题方法（如听力速记、排除法） |
| 13 | 情感升华 | 价值观 | 1-2 句温暖/正向的主题升华 |
| 14 | 作业 | 巩固 | 复习表达 + 配套练习 |
| 15 | 致谢 | 收尾 | "Thanks for listening!" |

## 二、视觉规范（复刻原课件风格）
- **尺寸**：16:9（13.333″ × 7.5″），白底。
- **标题字体**：活泼无衬线；任务标签用 **Comic Sans MS** 红色（Task 1/2）或紫色（Task 3 / 限时），正文中文用微软雅黑。
- **配色**：每页标题色可活泼变化（红 #FF0000 / 蓝 #0000FF / 紫 #FF00FF / 紫蓝 #6600FF），但保持整体明亮。
- **作者署名**：每页右上角小字（如 "FannyWu"）。
- **配图与图文排版**：图文同页采用**左文右图双栏独立排版**——正文限左栏（≤7.0″ 宽），图片固定在右栏（≥7.9″ 起），两区互不重叠；每页配图使用 PowerPoint **原生图片占位符**（type 18），教师在 PowerPoint 里点击占位图标即可选择本地图片插入；听力/视频页使用**媒体占位符**（type 10），点击即可插入本地音频/视频。
- **计时器**：Task 3 右下角放计时器占位（原课件用 StopWatch 插件）。
- **中英双语**：标题/关键词中英对照，例句保留英文语境。
- **字号**：已放大以保证投影/宽屏可读性——封面 54、模块标题 38、Task 标签 38、正文 24-26、署名 15。过密页如需更大字号可拆分。
- **动画**：每页所有文字/图片默认加 **Fade 淡入** 入场动画（点击触发），由后处理脚本写入。
- **媒体**：图片/音频/视频不再通过 JSON 路径嵌入；统一使用**占位符**，由人类在 PowerPoint 中点击占位符插入本地素材。

## 二之一、媒体与动画（增强能力）

技能采用"母版占位符 + 两阶段产出"架构：

1. **母版 `template.pptx`**：由 `scripts/build_template.ps1`（PowerPoint COM）生成，含 8 个自定义版式，每个版式里内置真实的 Title / Body / Picture / MediaClip 占位符。
   - **Picture 占位符（type 18）**：在 PowerPoint 中点击即弹出本地文件选择器 → 插入本地图片。
   - **MediaClip 占位符（type 10）**：点击即弹出本地音视频选择器 → 插入本地音频/视频。
   - 未插入素材的占位符在放映/打印时自动隐藏，不会留下空白框。
2. **内容填充 `build_pptx.py`**：读取 JSON，按模块选用版式，写入标题与正文；保留页面上的 Picture / MediaClip 占位符不动，供教师后续点击插入素材。
3. **动画后处理 `postprocess_anim.ps1`**：用 PowerPoint COM 给所有文字形状添加 Fade 淡入；名称含 `REVEAL_ANSWER` 的框设为"点击才出现"，其余自动连播。
4. **素材清单**：`build_pptx.py` 会同时生成 `<输出名>_素材清单.txt`，逐条列出「第几页 / 哪个模块 / 该放什么类型的本地素材」，教师按清单准备图片/音频/视频，再点击对应占位符插入即可。

## 三、内容展开方法（对任意话题都适用）

给定话题 X（如 Food / 运动 / 旅行），按如下方式生成各模块内容：

- **Task 1 词汇**：选 6 个 X 的核心名词（场所/物品/类别），中英对照，每词一句配图说明。
  - 例（购物）：shop/store 商店 · mall 购物中心 · supermarket 超市 · market 市场 · drugstore 药店 · shopping online 网购
- **Brain storm**：围绕核心词根拓展——近义词、反义词、相关词性。
  - 例：price 价格 → cheap 便宜 / expensive 贵 / free 免费；buy 买 → sell 卖 / pay 付 / spend 花 / cost 花费
- **Let's read**：做英汉互译填空（中文短语留空让填英文，或英文留空填中文）。
- **文化热点**：X 在生活中的真实热点事件/节日。
  - 例（购物）：双十一 11.11 网购狂欢； food→年夜饭/中秋；sports→奥运会。
- **Task 2 对话补全**：编一段 X 情景对话，挖空关键句（疑问词、价格、尺寸、颜色、选择等），给 1 句 Tips（结合上下文/注意形式）。
- **功能表达**：归纳 X 的交际句型，分两类（如 发问方 / 应答方，或 店员 / 顾客）。
- **Task 3 角色扮演**：给 2-3 个具体情景（含人物关系、目标、约束），标注"限时 X mins"。
- **中考听力**：引用**真实中考真题**（标注年份+省份），每组含：题干 + 三选项(A/B/C) + 听力原文 + 1 条"巧记技巧"。
  - 例：「（2011 年广东省英语初中毕业生学业考试）」涉及价格的听力题要注意数量与优惠。
- **技巧秘籍**：总结 2-3 条该话题通用答题方法（速记、圈关键词、排除法、同义替换等）。

## 四、输入 JSON 格式（喂给 build_pptx.py）

见 `examples/shopping.json`（本技能自带的"购物"样例，字段即规范）。
顶层字段：
```
meta            { topic_en, topic_cn, author, grade, cover_title, cover_subtitle, assets_dir? }
              # assets_dir 可选：素材文件夹路径（默认 <输出名>_assets，人类按 README 放入图片/音视频）
objectives      [str, ...]                       # 学习目标
lead_in         { questions:[], intro, images:[] }
task1           { label, desc, items:[{word,cn}], images:[] }
brainstorm      { title, items:[{word,cn}] }
lets_read       { title, items:[{en,cn}] }
culture         { question, fact, images:[] }
task2           { label, tag, lines:[{speaker,time,text,answer}], tips, images:[] }
expressions     { shop_assistant:[], customer:[] }   # 或 { ask:[], answer:[] }
task3           { label, tag, time_limit, scenes:[] }
listening_intro str
listening       [ { title, stem, question, options:[], source, script, tip } ]
tips_summary    { title, items:[] }
closing         { lines:[] }
homework        { items:[] }
thanks          str
media           { video:{模块键:路径}, audio:{模块键:路径} }  # 可选：视频/音频嵌入
```
`images` 字段为可选图片路径数组（绝对或相对脚本目录）；省略或文件不存在时自动画灰框占位。

## 五、执行步骤
1. 与用户确认：话题（中+英）、学段、作者署名、是否需要真实配图/音视频。
2. 按 SOP 三节展开内容，组织成 JSON（可参考 examples/shopping.json）。
3. 生成基础课件（用 managed python）：
   ```
   C:\Users\user\.workbuddy\binaries\python\versions\3.13.12\python.exe \
     <技能目录>\scripts\build_pptx.py --json <你的JSON> --out <输出.pptx>
   ```
   生成后会在输出同目录产生 `<输出>_素材清单.txt`。
4. 加 **Fade 入场动画** + 练习题答案"点击再出现"（需本机已装 PowerPoint）：
   ```
   powershell -File <技能目录>\scripts\postprocess_anim.ps1 -pptx <输出.pptx>
   ```
5. 把生成的 `.pptx` 与 `<输出>_素材清单.txt` 一起交付用户。提示：在 PowerPoint 里点击图片占位符即可插入本地图片，点击媒体占位符即可插入本地音频/视频；按清单逐页准备素材即可。

## 注意
- 中考听力题尽量引用**真实真题**并标注出处，避免杜撰年份/省份。
- 保持 16:9、白底、活泼彩色标题、任务标签化的原风格，不要改成极简风。
- 作者署名每页右上角都要有。
- 动画/音频后处理依赖本机 PowerPoint；若环境无 PowerPoint，可跳过第 4 步，仅交付静态版。
