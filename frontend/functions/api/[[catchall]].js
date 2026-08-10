import { createPPT as xfyunCreatePPT, getProgress as xfyunGetProgress, getTemplates as xfyunGetTemplates, createOutline as xfyunCreateOutline } from './lib/xfyun.js';

// ─── 讯飞PPT生成 任务暂存（Workers 内存，部署后以实例为单位） ───
// 生产环境如需跨实例持久化，建议改用 Cloudflare KV（参考下方 lessons CRUD 实现）
const XFYUN_TASKS = {};

const TEMPLATES = [
  {"id":"classic-education","name":"经典教学","description":"适合中小学课堂教学的经典模板","category":"education","features":["teacher_guide","interactive"],"price_tier":"free","color_scheme":{"primary":"#2B5C8F","secondary":"#5B9BD5","accent":"#E8751A","background":"#FFFFFF","text":"#333333"},"fonts":{"title":"微软雅黑","body":"微软雅黑"}},
  {"id":"story-magic","name":"故事魔法","description":"适合语文、英语等故事性课程","category":"education","features":["teacher_guide","image_gen","music"],"price_tier":"pro","color_scheme":{"primary":"#8B5E3C","secondary":"#D4A574","accent":"#FF6B6B","background":"#FFF8F0","text":"#4A3728"},"fonts":{"title":"微软雅黑","body":"微软雅黑"}},
  {"id":"science-lab","name":"科学实验室","description":"理科课程专用，科技感配色","category":"education","features":["animation","image_gen","teacher_guide"],"price_tier":"pro","color_scheme":{"primary":"#1A237E","secondary":"#00BCD4","accent":"#76FF03","background":"#F5F5F5","text":"#212121"},"fonts":{"title":"微软雅黑","body":"微软雅黑"}},
  {"id":"premium-business","name":"商务精英","description":"高端商务汇报模板","category":"business","features":["teacher_guide","animation","music","voiceover"],"price_tier":"school","color_scheme":{"primary":"#1B1F3B","secondary":"#4A4E69","accent":"#C9A84C","background":"#FAFAFA","text":"#1A1A1A"},"fonts":{"title":"微软雅黑","body":"微软雅黑"}}
];

const MOCK_RESULT = {
  topic: "Unit 7 A day to remember",
  meta: { subject: "英语", grade: "七年级", book: "人教版", lesson_type: "新授课", lesson_period: "第1课时" },
  pages: 13,
  file_name: "demo_sample.pptx",
  teacher_guide: [{ page_number: 1, teacher_script: "同学们好，今天我们来学习Unit 7。请大家看屏幕上的图片，猜猜我们今天要学什么？", questions: [{ question: "What can you see in the picture?", expected_answer: "A special day", type: "开放式" }], student_activity: "小组讨论：你记忆中难忘的一天", time_allocation: "5分钟" }],
  scripts: [{ page_number: 1, speech: "Today we are going to learn about unforgettable days...", timing_seconds: 120 }],
  games: [
    { type: "小组竞赛", name: "动词变身接力赛", phase: "练习", duration: "8分钟", description: "将全班分成4-5组，每组站成一列。教师在黑板上写出10个动词原形。每组第一个学生跑到黑板前，将第一个动词改为过去式，然后跑回与下一个学生击掌。", materials: ["黑板", "粉笔"], learning_goal: "巩固动词过去式变化" },
    { type: "选择", name: "难忘时刻猜猜猜", phase: "导入", duration: "5分钟", description: "教师展示4张图片，每张对应一个过去式句子。学生选择最可能对应课题的图片。", materials: ["图片"], learning_goal: "激发学习兴趣" }
  ],
  homework: [
    { tier: "基础", title: "动词变身小练习", estimated_time: "5分钟", difficulty: "容易" },
    { tier: "基础", title: "Tom的早晨填空", estimated_time: "5分钟", difficulty: "容易" },
    { tier: "拓展", title: "我的难忘一天", estimated_time: "10分钟", difficulty: "中等" },
    { tier: "拓展", title: "动词变身规则归纳", estimated_time: "8分钟", difficulty: "中等" },
    { tier: "实践", title: "家庭采访：昨天的事", estimated_time: "15分钟", difficulty: "中等" },
    { tier: "实践", title: "我的昨天时间线", estimated_time: "15分钟", difficulty: "困难" }
  ],
  theme_elevation: { core_value: "珍视生活中的美好瞬间", format: "故事与音乐", duration: "3分钟", content: "播放轻柔钢琴曲，展示温馨图片组。教师讲述一个难忘的昨天故事，引导学生用一般过去时分享自己的难忘一天。" }
};

const AGENTS = [
  { id: 1, name: "教材分析Agent", desc: "分析教材知识结构、重难点" },
  { id: 2, name: "学习目标Agent", desc: "生成知识目标、能力目标、素养目标" },
  { id: 3, name: "学情诊断Agent", desc: "预测学生困难和错误概念" },
  { id: 4, name: "情境创设Agent", desc: "生成视频、图片、游戏导入" },
  { id: 5, name: "任务链Agent", desc: "设计由易到难的学习任务链" },
  { id: 6, name: "主题升华Agent", desc: "设计价值引领与情感升华" },
  { id: 7, name: "教学流程Agent", desc: "生成40分钟课堂流程安排" },
  { id: 8, name: "游戏活动Agent", desc: "设计课堂互动游戏与活动" },
  { id: 9, name: "评价设计Agent", desc: "设计形成性评价与课堂反馈" },
  { id: 10, name: "课件视觉Agent", desc: "设计PPT版式、配色、动画" },
  { id: 11, name: "多媒体资源Agent", desc: "生成配图、动画、音频素材" },
  { id: 12, name: "作业设计Agent", desc: "生成基础/拓展/实践分层作业" },
  { id: 13, name: "质量审核Agent", desc: "检查教学合理性与课标匹配" }
];

const TASKS = {};
const TEXTBOOK_DB = [];
const GRADING_TASKS = {};
const SUBJECTS = ['语文','数学','英语','物理','化学','生物','历史','地理','政治'];
const GRADE_LEVELS = ['小学一年级','小学二年级','小学三年级','小学四年级','小学五年级','小学六年级','初中一年级','初中二年级','初中三年级','高中一年级','高中二年级','高中三年级'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

function getPath(url) {
  return url.pathname.replace(/\/+$/, '') || '/';
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSlideContent(topic, subject, grade, taskDesc) {
  const subj = (subject || '').toLowerCase();
  const g = (grade || '').toLowerCase();
  const t = (topic || '').toLowerCase();
  const templates = [];

  // 物理 - 杠杆
  if (t.includes('杠杆') || (subj.includes('物理') && t.includes('杠杆'))) {
    templates.push(
      { title: '什么是杠杆', points: ['一根硬棒，在力的作用下能绕着固定点转动', '支点：杠杆绕着转动的固定点（O）', '动力：使杠杆转动的力（F₁）', '阻力：阻碍杠杆转动的力（F₂）'] },
      { title: '杠杆的五要素', points: ['支点（O）：杠杆绕其转动的点', '动力臂（L₁）：支点到动力作用线的距离', '阻力臂（L₂）：支点到阻力作用线的距离', '动力（F₁）和阻力（F₂）'] },
      { title: '杠杆平衡条件', points: ['动力 × 动力臂 = 阻力 × 阻力臂', '公式：F₁L₁ = F₂L₂', '这是阿基米德发现的杠杆原理', '应用：用小的力撬动重的物体'] },
      { title: '省力杠杆', points: ['动力臂 > 阻力臂，省力但费距离', '举例：开瓶器、羊角锤、撬棍', '优点：可以用较小的力撬动重物', '注意：省力杠杆费距离'] },
      { title: '费力杠杆', points: ['动力臂 < 阻力臂，费力但省距离', '举例：钓鱼竿、镊子、理发剪刀', '优点：可以节省操作空间', '注意：虽然费力但更精确'] },
      { title: '等臂杠杆', points: ['动力臂 = 阻力臂，不省力也不费力', '举例：天平、跷跷板', '特点：平衡时两端力相等', '应用：实验室天平测量质量'] },
      { title: '生活中的杠杆', points: ['剪刀：刀刃短、手柄长 → 省力杠杆', '镊子：动力臂短、阻力臂长 → 费力杠杆', '指甲剪：组合杠杆', '人体中的杠杆：手臂、腿部骨骼'] },
      { title: '课堂小结', points: ['杠杆：在力的作用下绕固定点转动的硬棒', '五要素：支点、动力、阻力、动力臂、阻力臂', '平衡条件：F₁L₁ = F₂L₂', '分类：省力杠杆、费力杠杆、等臂杠杆'] },
    );
  }
  // 英语 - Unit 语法
  else if (subj.includes('英语') || subj.includes('english')) {
    const unitMatch = topic.match(/[Uu]nit\s*(\d+)/);
    const unitNum = unitMatch ? unitMatch[1] : '';
    templates.push(
      { title: `${topic} 学习目标`, points: ['掌握本单元的核心词汇和短语', '理解主要语法结构', '能够运用所学进行日常交流', '培养英语学习兴趣'] },
      { title: '核心词汇', points: ['学习本单元新词汇和短语', '掌握正确的发音和拼写', '理解词汇在不同语境中的用法', '通过例句加深记忆'] },
      { title: '重点语法', points: ['本单元的重点语法结构', '语法规则详解与例句', '常见错误分析', '对比辨析易混知识点'] },
      { title: '听力训练', points: ['听录音完成听力练习', '抓住关键信息和关键词', '培养听力理解能力', '跟读模仿语音语调'] },
      { title: '口语练习', points: ['两人一组进行对话练习', '角色扮演：模拟真实场景', '用所学词汇和句型表达观点', '注意语音语调和肢体语言'] },
      { title: '阅读理解', points: ['阅读课文并理解主旨大意', '分析文章结构和写作手法', '完成阅读理解练习', '积累好词好句'] },
      { title: '写作指导', points: ['学习本单元写作框架', '运用新学词汇和句型', '注意段落衔接与连贯性', '写作后检查语法错误'] },
      { title: '课堂总结', points: ['回顾本单元核心知识点', '梳理词汇、语法、句型', '反思学习过程中的难点', '布置课后作业'] },
    );
  }
  // 数学
  else if (subj.includes('数学') || subj.includes('math')) {
    templates.push(
      { title: `${topic} 学习目标`, points: ['理解核心概念和定义', '掌握基本公式和定理', '能够运用知识解决实际问题', '培养数学思维和逻辑推理能力'] },
      { title: '知识要点', points: ['基本概念和定义', '重要公式和定理', '性质与判定方法', '常见题型分析'] },
      { title: '典型例题', points: ['例题1：基础题型解析', '例题2：综合应用题型', '例题3：拓展提高题型', '解题思路与方法总结'] },
      { title: '易错点分析', points: ['常见错误类型', '错误原因分析', '如何避免类似错误', '巩固练习建议'] },
      { title: '方法总结', points: ['解题技巧归纳', '数学思想方法', '知识框架梳理', '学习策略建议'] },
      { title: '课堂练习', points: ['基础过关练习', '能力提升练习', '拓展探究练习', '限时训练与自我检测'] },
    );
  }
  // 语文
  else if (subj.includes('语文') || subj.includes('chinese')) {
    templates.push(
      { title: `${topic} 学习目标`, points: ['正确、流利、有感情地朗读课文', '理解课文主旨和写作思路', '积累优美词句', '体会作者思想感情'] },
      { title: '背景介绍', points: ['作者生平及创作背景', '时代背景与社会环境', '文学地位与艺术价值', '相关知识拓展'] },
      { title: '课文解析', points: ['整体感知：把握文章脉络', '精读赏析：品味语言特色', '重点段落的深层理解', '写作手法分析'] },
      { title: '词句积累', points: ['重点词语的理解与运用', '优美句段的背诵积累', '修辞手法的识别与仿写', '语言表达技巧学习'] },
      { title: '思考探究', points: ['课后思考题讨论', '小组合作探究', '拓展阅读与比较', '联系生活实际思考'] },
      { title: '写作训练', points: ['学习本文的写作方法', '仿写片段练习', '创意表达与个性写作', '互相评改与交流'] },
    );
  }
  // 默认 - 通用课件模板
  else {
    templates.push(
      { title: `${topic} 课程导入`, points: ['展示与课题相关的图片或视频', '提出问题引发学生思考', '联系生活实际引入新课', '明确本节课的学习目标'] },
      { title: '知识讲解', points: [`系统讲解${topic}的核心概念`, '通过举例帮助学生理解', '突出重点，突破难点', '板书设计清晰有条理'] },
      { title: '合作探究', points: ['小组讨论：围绕课题展开交流', '动手实践：操作体验加深理解', '汇报分享：各小组展示成果', '教师点评与总结提升'] },
      { title: '练习巩固', points: ['基础练习：巩固核心知识点', '综合练习：提高应用能力', '拓展练习：培养创新思维', '即时反馈与针对性指导'] },
      { title: '课堂总结', points: [`回顾${topic}的核心内容`, '梳理知识框架与思维导图', '学生分享学习心得', '布置课后作业'] },
    );
  }

  // Add intro slide at front
  templates.unshift({ title: `${topic} 概述`, points: [`课题：${topic}`, subject ? `学科：${subject}` : '', grade ? `年级：${grade}` : '', '让我们一起探索这个精彩的课题！'].filter(Boolean) });

  return templates.slice(0, 12);
}

// ─── manatee 公开课阅读课 12 步范式（确定性生成，纯 JS 无需 LLM） ───
// 提炼自朱丹老师《Unit 15 We're trying to save the manatees!》公开课课件。
function generateManateeSlides(topic, subject, grade, textbookContent) {
  const title = topic || '英语阅读公开课';
  const unitMatch = String(title).match(/[Uu]nit\s*(\d+)/);
  const unitNum = unitMatch ? unitMatch[1] : '';
  const text = textbookContent || '';
  const keyStruct = text.includes('made from') || text.includes('out of')
    ? 'make/build A out of B  |  be made from / of / in / by / into'
    : 'make/build A out of B（用 B 制造/建造 A）';
  const slides = [];

  // 1 封面
  slides.push({ title, points: ['公开课阅读课 · 12 步范式', subject + ' · ' + (grade || '初中'), 'Section B 3a', '授课教师：________'] });
  // 2 学习目标
  slides.push({ title: title + ' 学习目标', points: ['To practice reading skills.（练习阅读技能）', 'To learn some important structures.（学习重要句型结构）', 'To talk about ' + (text.includes('recycle') || text.includes('trash') ? 'recycling and saving energy' : 'the topic') + '.（学会表达主题观点）'] });
  // 3 悬念导入
  slides.push({ title: '人物导入 Lead-in', points: ['Introduce the main character / Amy Winterbourne.', '?  What makes her / him unusual?', '观看/观察图片，猜一猜：主角有什么特别之处？'] });
  // 4 图片点题
  slides.push({ title: '点题句', points: ['Her / His ... makes her / him unusual.', 'It is made from trash.（由垃圾制成）', '点出核心句型：make/build A out of B'] });
  // 5 主题呈现
  slides.push({ title: title + ' · 主题呈现', points: ['The house of trash 垃圾屋', 'A story about recycling and creativity', '思考：这个故事想告诉我们什么？'] });
  // 6 Task 1 扫读 T/F
  slides.push({ title: 'Task 1 · 快速阅读（T/F）', points: ['Read the article quickly and write T or F.', '1. The main character is a common person. (F)', '2. The house is made from trash. (T)', '3. The character never helps others. (F)', '4. 带着问题快速浏览标题与首尾句作答。'] });
  // 7 Task 2 细读问答
  slides.push({ title: 'Task 2 · 细读理解', points: ['Read carefully and answer the questions.', 'Q1: What is the house made from?', 'Q2: Who built the house?', 'Q3: What does she make out of old TVs?', 'Q4: Why does she do that?（点击显示答案）'] });
  // 8 Task 3 听读填表
  slides.push({ title: 'Task 3 · 听读填表', points: ['Listen and fill in the chart.（听录音填写信息表）', 'Old glass bottles → ________', 'The roof → ________', 'The fence → ________', 'Old TVs → ________'] });
  // 9 Task 4 朗读质疑 + 语法聚焦
  slides.push({ title: 'Task 4 · 朗读质疑', points: ['Read aloud and raise your questions.', 'Find the key structure: ' + keyStruct, '同学们在朗读中发现的疑问，一起来解决。'] });
  // 10 语法聚焦
  slides.push({ title: '语法聚焦 Grammar Focus', points: ['make/build A out of B（用 B 制造 A）', 'be made from（看不出原材料）/ of（看得出原材料）', 'be made in + 产地 / by + 制作人 / into + 制成物', '例句：The skirt is made of silk.'] });
  // 11 练习
  slides.push({ title: 'Exercise · 练习巩固', points: ['Complete the sentences with from / of / in / by / into.', '1. Our desks are made ____ wood. (of)', '2. Paper is made ____ wood. (from)', '3. These cars are made ____ Japan. (in)', '4. The toy is made ____ my father. (by)'] });
  // 12 讨论 + 写作
  slides.push({ title: '讨论 Discussion + 写作 Writing', points: ['Discussion: What can we do to save energy in daily life?', 'Writing: 以 "How we should save energy" 为题写 80 词短文', '连接词支架：First, ... Second/Next/Then, ... At last, ...', '提出 3 点节能建议，谈谈你的看法。'] });
  // 13 意义追问
  slides.push({ title: '意义追问 Why', points: ['Why does the character recycle the trash?', 'To save energy.（节能）', 'To protect the environment.（环保）', 'To help save our earth.（保护地球）'] });
  // 14 Summary
  slides.push({ title: 'Summary 总结', points: ['Key structures: ' + keyStruct, 'Conjunctions: First, ... / At last, ...', 'How to save energy: turn off lights, take a bus, collect waste paper', 'Let\'s try our best to save energy and protect our home!'] });
  // 15 情感升华
  slides.push({ title: '情感升华', points: ['Saving energy is important to us.', 'Let\'s try our best to protect our home.', 'Take action now!'] });
  // 16 名言
  slides.push({ title: '名言激励', points: ['Never put off till tomorrow what you can do today.', '今日事今日毕。', 'Take action now!'] });
  // 17 作业
  slides.push({ title: 'Homework 课后作业', points: ['必做：写一篇 "How we should save energy" 的英文短文', '必做：完成课文配套练习', '选做：制作一张节能宣传小海报'] });
  // 18 致谢
  slides.push({ title: 'Thanks for listening!', points: [title, '公开课阅读课 · manatee 范式', '感谢聆听'] });

  return slides;
}

async function callDeepSeek(apiKey, prompt, maxTokens = 4096) {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(45000),
  });
  if (!resp.ok) {
    throw new Error('DeepSeek HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200));
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callDeepSeekVision(apiKey, textPrompt, images) {
  const content = [{ type: 'text', text: textPrompt }];
  for (const img of images) {
    content.push({ type: 'image_url', image_url: { url: img } });
  }
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content }], temperature: 0.7, max_tokens: 4096 })
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJson(text) {
  if (!text) return null;
  let src = String(text).trim();
  // 剥离 markdown 代码块围栏（```json ... ```）
  src = src.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  // 尝试直接解析
  try { return JSON.parse(src); } catch {}
  // 尝试提取第一个完整 { } 对（正确处理嵌套与字符串内的大括号）
  const candidates = [];
  let start = -1, depth = 0, inStr = false, esc = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') { if (start === -1) start = i; depth++; }
    else if (ch === '}') { depth--; if (depth === 0 && start !== -1) { candidates.push(src.slice(start, i + 1)); start = -1; } }
  }
  for (const cand of candidates) {
    try { return JSON.parse(cand); } catch {}
  }
  // 最后尝试贪婪匹配
  const match = src.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

// 无 API Key 时生成单页规则内容
function buildRuleSlide(topic, pageType, pageLabel) {
  const t = topic || '本课';
  const defaults = {
    cover: { title: t, narrative: `今天我们将一起学习「${t}」。`, goal: '引入课题', content: [t, '让我们一起探索这个精彩的课题！'] },
    warmup: { title: '热身导入', narrative: '我们先来热热身，激活已有知识。', goal: '激活背景知识', content: [`关于「${t}」你已了解什么？`, '观看/讨论相关情境'] },
    vocabulary: { title: '核心词汇', narrative: '先认识本课核心词汇。', goal: '掌握核心词汇', content: ['词1 释义', '词2 释义', '词3 释义'] },
    story: { title: '故事环节', narrative: '我们一起来读这个故事。', goal: '理解故事情节', content: ['故事的开端……', '故事的发展……', '故事的结局……'] },
    animation: { title: '情景动画', narrative: '观看情景动画，理解内容。', goal: '通过动画理解知识', content: ['场景一：……', '场景二：……'] },
    grammar: { title: '语法讲解', narrative: '我们学习本课的语法重点。', goal: '掌握语法规则', content: ['规则一：……', '例句：……', '规则二：……'] },
    reading: { title: '阅读与写作', narrative: '我们做阅读和写作练习。', goal: '提升读写能力', content: ['阅读任务：通读并概括大意', '写作任务：仿写一句话'] },
    speaking: { title: '口语练习', narrative: '我们来练习口语对话。', goal: '提升口语表达', content: ['角色扮演：分角色对话', '小组讨论'] },
    game: { title: '游戏闯关', narrative: '我们来玩一个游戏巩固知识！', goal: '在游戏中巩固', content: ['游戏规则：……', '第1题：……', '第2题：……'] },
    summary: { title: '课堂总结', narrative: '回顾今天所学。', goal: '梳理知识框架', content: ['回顾要点一', '回顾要点二', '升华主题'] },
    homework: { title: '课后作业', narrative: '这是今天的作业。', goal: '巩固拓展', content: ['基础：完成课后练习', '拓展：……', '实践：……'] },
    knowledge: { title: '知识讲解', narrative: `我们来学习「${t}」的知识点。`, goal: '掌握知识点', content: ['知识点：……', '要点说明：……'] },
    example: { title: '典型例题', narrative: '看一道例题，理解方法。', goal: '学会解题方法', content: ['例题：……', '解析：……', '方法总结：……'] },
    practice: { title: '课堂练习', narrative: '我们来做几道练习。', goal: '巩固所学', content: ['练习1：……', '练习2：……', '练习3：……'] },
    detail: { title: '精读理解', narrative: '仔细阅读，理解细节。', goal: '理解课文细节', content: ['细节1：……', '细节2：……'] },
    discussion: { title: '课堂讨论', narrative: '我们来讨论这个话题。', goal: '培养思辨能力', content: ['讨论话题：……', '提示：结合所学知识思考'] },
    writing: { title: '写作任务', narrative: '请完成写作任务。', goal: '提升写作能力', content: ['写作主题：……', '要点提示：……', '连接词：First.../Then.../At last...'] },
    review: { title: '复习检测', narrative: '我们复习本课重点。', goal: '巩固复习', content: ['要点1：……', '要点2：……'] },
  };
  const d = defaults[pageType] || defaults.knowledge;
  return { title: pageLabel || d.title, narrative: d.narrative, goal: d.goal, content: [...d.content] };
}

// ─── 教材内容分析引擎 ───
// 规则化解析用户粘贴的教材原文：提取定义句、关键术语、例题、探究问题、公式，
// 并基于真实抽取的内容重构课件，而非机械拼贴课题名。
function splitSentences(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/([。！？；;!?])\s*/g, '$1\n')
    .split('\n')
    .map(s => s.trim().replace(/^[-–•·*\s]+/, '').replace(/^[（(]\s*[\d一二三四五六七八九十]+\s*[)）]\s*/, '').replace(/^[\d一二三四五六七八九十]+[、.．]\s*/, ''))
    .filter(s => s.length >= 3);
}

const QUOTE_RE = /[“"「『]([^”"」』]{2,16})[”"」』]/g;
const STOP_PREFIX = /^(我们|本章|本节|本课|这|其中|在|例如|比如|如|可见|因此|所以|总之|由此可见|综上|同学们|接下来|下面|此外)/;
// 形式一：X 是/表示/称为/定义为 Y（概念在前）
const DEF_X_RE = /^(.{2,18}?)(?:是指|指的是|就是|表示|称为|叫做|定义为|的意思是)(.+)$/;
// 形式二：X 叫 Y / X 为 Y（概念在后）
const DEF_Y_RE = /^(.{2,18}?)叫(.+)$/;

function analyzeTextbook(text, topic) {
  const sentences = splitSentences(text);
  const defs = [];
  const terms = new Set();
  const examples = [];
  const questions = [];
  const formulas = [];
  const matched = new Set();

  for (const raw of sentences) {
    const s = raw.replace(/^[\d一二三四五六七八九十]+[、.．]\s*/, '').trim();
    if (!s) continue;
    for (const m of s.matchAll(QUOTE_RE)) terms.add(m[1]);
    const dmx = s.match(DEF_X_RE);
    if (dmx) {
      const term = dmx[1].replace(/[、，,\s]/g, '').trim();
      if (term.length >= 2 && term.length <= 14 && !STOP_PREFIX.test(term)) {
        defs.push({ term, def: dmx[2].trim() });
        terms.add(term);
        matched.add(raw);
      }
      continue;
    }
    const dmy = s.match(DEF_Y_RE);
    if (dmy) {
      const term = dmy[2].replace(/[（(].*/, '').replace(/[、，,\s]/g, '').trim();
      if (term.length >= 2 && term.length <= 14 && !STOP_PREFIX.test(term)) {
        defs.push({ term, def: dmy[1].trim() + '叫' + term });
        terms.add(term);
        matched.add(raw);
      }
      continue;
    }
    if (/(例如|比如|如[:：]|举例|实例|譬如)/.test(s)) {
      examples.push(s);
      matched.add(raw);
    } else if (/[?？]$/.test(s) || /^(为什么|如何|怎样|怎么|什么是|何为|有哪些|能否|是否|请说明|说一说)/.test(s)) {
      questions.push(s);
      matched.add(raw);
    } else if (/[=＝]/.test(s) || /(公式|定理|法则|定律|规律)/.test(s)) {
      formulas.push(s);
      matched.add(raw);
    }
  }

  const highlights = sentences
    .filter(raw => !matched.has(raw))
    .map(raw => raw.replace(/^[\d一二三四五六七八九十]+[、.．]\s*/, '').trim())
    .filter(s => s.length >= 14 && s.length <= 130)
    .filter(s => !/(例如|比如|如[:：])/.test(s))
    .filter(s => !/[?？]$/.test(s))
    .slice(0, 10);

  return {
    definitions: defs.slice(0, 8),
    keyTerms: [...terms].filter(t => t !== topic).slice(0, 8),
    examples: examples.slice(0, 5),
    questions: questions.slice(0, 6),
    formulas: formulas.slice(0, 4),
    highlights: highlights.slice(0, 8),
    hasContent: defs.length > 0 || highlights.length >= 2 || terms.size >= 2,
  };
}

function buildObjectives(topic, a) {
  const t = a.keyTerms.slice(0, 2);
  const t1 = t[0] || topic;
  const t2 = t[1];
  if (!a.hasContent) {
    return [
      `理解"${topic}"的核心概念与基本定义`,
      `掌握"${topic}"的关键要点，能用自己的话复述`,
      `能运用"${topic}"的知识分析并解决实际问题`,
      `通过探究活动，体会学科知识与生活的联系`,
    ];
  }
  const objs = [
    `识记：准确理解"${t1}"的概念定义${t2 ? `，并能说出"${t2}"的内涵` : ''}，初步构建知识结构`,
  ];
  if (a.examples.length) {
    objs.push(`理解：借助教材实例"${a.examples[0].slice(0, 20)}…"，分析"${topic}"知识的实际运用`);
  } else {
    objs.push(`理解：能用自己的语言解释"${topic}"的重点内容与原理`);
  }
  if (a.questions.length) {
    objs.push(`应用：能结合教材探究问题"${a.questions[0].slice(0, 18)}…"进行思考，做到学以致用`);
  } else {
    objs.push(`应用：能运用"${topic}"的知识解决相关练习与实际问题`);
  }
  objs.push('素养：通过合作探究提升分析归纳能力，养成严谨的学科思维');
  return objs.slice(0, 4);
}

function buildClassFlow(topic, a) {
  return [
    { time: '5分钟', phase: '情境导入', desc: a.hasContent && a.questions.length ? `以问题"${a.questions[0].slice(0, 16)}…"切入课题，激活已有经验` : `创设情境，激活关于"${topic}"的已有经验`, icon: '导入' },
    { time: '10分钟', phase: '新知探究', desc: a.hasContent ? '结合教材原文，梳理核心概念与关键要点' : `探究"${topic}"的核心知识`, icon: '探究' },
    { time: '15分钟', phase: '合作学习', desc: a.hasContent && a.examples.length ? `小组研读教材实例，讨论${a.keyTerms[0] || topic}的实际运用` : `围绕"${topic}"开展小组合作交流`, icon: '合作' },
    { time: '10分钟', phase: '练习巩固', desc: a.hasContent && a.questions.length ? '利用教材探究题进行当堂检测与即时反馈' : `通过课堂练习检验"${topic}"的掌握情况`, icon: '练习' },
    { time: '5分钟', phase: '总结提升', desc: `梳理"${topic}"的知识框架，升华主题`, icon: '总结' },
  ];
}

// 英语课文 → 阅读课增强教学环节（无 API Key 时也能生成较完整的教学流程）
function buildEnglishReadingSlides(topic, subject, grade, book, a, textbookContent) {
  const t1 = a.keyTerms[0] || topic;
  const sentences = splitEnglishSentences(textbookContent);
  // 提取英文关键词（大写名词/较长的词），过滤常见虚词
  const stopWords = new Set(['The', 'And', 'For', 'She', 'He', 'Amy', 'Unit', 'But', 'His', 'Her', 'They', 'This', 'That', 'With', 'From', 'Into', 'When', 'What', 'Where', 'Then', 'Their', 'There', 'Some', 'More']);
  const vocabSet = new Set();
  String(textbookContent || '').match(/[A-Z][a-z]{2,}/g)?.forEach(w => {
    if (!stopWords.has(w) && vocabSet.size < 8) vocabSet.add(w);
  });
  const vocab = [...vocabSet];
  const coreLines = sentences.slice(0, 5);   // 精读段落
  const extraLines = sentences.slice(5, 9);  // 重点句式来源
  const detailQs = sentences.slice(0, 4);    // 检测题来源

  // ── 从课文真实句子生成 Task 1 扫读 T/F（T 基于课文真实信息，F 用反义干扰项） ──
  const tfSource = sentences.slice(0, 4);
  const tfItems = tfSource.map((s, i) => {
    const text = s.replace(/[.!?]+$/, '');
    // 偶数位置用真实句子(T)，奇数位置生成语义相反的干扰句(F)
    if (i % 2 === 0) {
      return { text, answer: 'T' };
    }
    // F 干扰项：替换频度/时间/地点词为反义（保持语法正确）
    const variants = [
      text.replace(/\btwice a week\b/i, 'once a year')
          .replace(/\bevery (morning|day)\b/i, 'only on weekends')
          .replace(/\bafter school\b/i, 'only at night')
          .replace(/\bin the park\b/i, 'in the classroom'),
      text.replace(/\b(do|practise|play|use|ride)\b/i, m => 'do not ' + m),
    ];
    const negated = variants[0] !== text ? variants[0] : variants[1];
    return { text: negated, answer: 'F' };
  });

  // ── 从课文真实句子生成 Task 2 细读问答（问题聚焦实义名词，答案是原文句子） ──
  const qaItems = sentences.slice(0, 4).map((s, i) => {
    const text = s.replace(/[.!?]+$/, '');
    const words = text.replace(/[.,]/g, '').split(' ').filter(w => w.length >= 3 && !stopWords.has(w));
    // 优先取句中大写名词（专有名词/主题词）
    const properNoun = (s.match(/\b[A-Z][a-z]{2,}\b/) || [null, words[0] || t1])[1];
    const noun = /^[A-Z]/.test(properNoun) ? properNoun : (words[0] || t1);
    const q = i % 2 === 0
      ? `What does the passage tell us about "${noun}"?`
      : `Why is "${noun}" important / mentioned in the passage?`;
    return { q, a: text };
  });

  // ── 重点句式：提取含动词结构的关键句 ──
  const keySentences = sentences
    .filter(s => /(?:is|are|was|were|has|have|can|will|should|must|be\s+\w+ed|used to|need to)\b/i.test(s))
    .slice(0, 4);

  // ── 读后检测题（含答案提示） ──
  const checkItems = [
    ...detailQs.slice(0, 3).map((s, i) => `Q${i + 1}. ${s.replace(/[.!?]+$/, '')}?（答案见课文）`),
  ];

  // ── 思维导图：用树状文字梳理文章结构 ──
  const mindMap = [
    `📌 文章主题：${topic}`,
    `├─ 人物/对象：${(vocab.slice(0, 2) || [t1]).join(' / ')}`,
    `├─ 事件/内容：`,
    `│   ${(coreLines[0] || '').slice(0, 40)}…`,
    `│   ${(coreLines[1] || '').slice(0, 40)}…`,
    `├─ 关键信息：${(detailQs.slice(0, 2) || []).map(s => s.slice(0, 30)).join(' / ')}`,
    `└─ 主题升华：${topic} → 联系生活`,
  ];

  const slides = [
    { component: 'cover', title: topic, subtitle: `${subject} · ${grade} · ${book}`, content: [`Reading · 阅读课`, `今天我们将一起学习"${topic}"`], narrative: `同学们好，今天是一节英语阅读课，让我们一起走进"${topic}"。`, goal: '引入课题，激发阅读兴趣', emotion: '好奇' },
    { component: 'warmup', title: `读前预热 Pre-reading`, content: [`讨论：关于"${topic}"你已了解什么？`, '预测：猜一猜文章会讲什么内容？', `关键词：${(vocab.length ? vocab.slice(0, 4).join(' / ') : '浏览标题和插图')}`], narrative: `在阅读之前，我们先来做一些预测和热身，激活已有知识。`, goal: '激活背景知识，预测文章内容', emotion: '期待' },
    { component: 'vocabulary', title: `词汇预习 Vocabulary`, content: vocab.length ? vocab.slice(0, 8).map(k => `· ${k}`) : [`· ${t1}`, '· 浏览标题猜测词义'], narrative: `先认识文章中的关键词汇，扫清阅读障碍。`, goal: '掌握核心词汇，为阅读做准备', emotion: '专注' },
    { component: 'grammar', title: `Task 1 扫读 True/False`, content: [
      `快速浏览全文，判断下列句子正误（True/False）：`,
      ...tfItems.map((it, i) => `${i + 1}. ${it.text}`),
      `答案：${tfItems.map(it => it.answer).join(' / ')}`,
    ], narrative: `第一遍快速阅读，判断句子正误，抓文章主旨。`, goal: '训练扫读抓主旨能力', emotion: '思考' },
    { component: 'knowledge', title: `Task 2 细读 Close Reading`, goal: '深入理解课文细节', content: [
      `仔细阅读，回答下列问题（答案见课文）：`,
      ...qaItems.slice(0, 4).map((it, i) => `Q${i + 1}. ${it.q}`),
    ], narrative: `第二遍仔细阅读，回答细节问题。`, emotion: '专注' },
    ...(keySentences.length ? [{
      component: 'example', title: `重点句式 Key Sentences`, goal: '掌握课文中的重点表达',
      content: keySentences.map(s => `· ${s}`), narrative: `这些是课文中的重点句式，请同学们划出来并仿写。`, emotion: '思考'
    }] : []),
    { component: 'practice', title: `Task 3 读后检测 After-reading`, goal: '检测理解，巩固知识', content: [
      ...checkItems,
      `用 2-3 句话概括文章大意（参考答案：本文主要讲述${(coreLines[0] || topic).slice(0, 40)}…）。`,
      `根据课文内容，用一句话回答问题：What is the passage mainly about?`,
    ], narrative: `读完后，我们来做一些检测练习，检验大家的理解。`, emotion: '挑战' },
    { component: 'game', title: `Task 4 小组活动 Group Work`, goal: '合作探究，深化理解', content: [
      `两人一组，用课文细节互相提问并作答（使用 Task 2 的问题）。`,
      `小组讨论：${a.questions[0] || `"${topic}"与我们的生活有什么联系？`}`,
      `角色扮演：朗读课文片段，注意语音语调。`,
    ], narrative: `接下来我们进行小组合作活动，用英语交流。`, emotion: '兴奋' },
    { component: 'vocabulary', title: `文章结构思维导图 Mind Map`, goal: '梳理文章结构', content: mindMap, narrative: `我们用思维导图来梳理这篇文章的结构，帮助理解。`, emotion: '专注' },
    { component: 'summary', title: '课堂总结 Summary', content: [`回顾文章结构：${t1} 等要点`, `重点句式：${(keySentences[0] || '').slice(0, 40)}…`, `主题升华：${topic}带给我们的启示`], narrative: `今天我们学习了"${topic}"，一起回顾重点。`, goal: '梳理知识框架，升华主题', emotion: '满足' },
    { component: 'homework', title: '课后作业 Homework', content: ['必做：朗读课文并完成课后练习', '必做：用新学的重点句式各写 1 个句子（至少 3 句）', '必做：整理本课思维导图并复述课文大意', '选做：制作一张主题手抄报或小海报'], narrative: `这是今天的作业，请按时完成。`, goal: '巩固拓展所学知识', emotion: '鼓励' },
  ];
  return { slides, pages: 11 + (keySentences.length ? 1 : 0) + 1 };
}

// 英文句子切分工具（过滤标题行与无动词的短句）
function splitEnglishSentences(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length >= 8 && /[A-Za-z]/.test(s))
    .filter(s => !/^Unit\s*\d+/i.test(s))
    // 排除 "How to ..." 标题模式
    .filter(s => !/^how\s+to\s+\w+/i.test(s))
    // 只保留含实义动词的句子（过滤标题/短语）
    .filter(s => /\b(?:am|is|are|was|were|has|have|had|do|does|did|can|could|will|would|should|must|may|might|practise|play|use|ride|keep|build|make|help|look|find|take|give|want|need|like|go|come|get|say|see|know|think|feel|work|run|walk|read|write|speak|study|learn|teach|watch|listen)\b/i.test(s));
}

// ─── 郑佳情境听说课范式（Unit 8 方位问路课）───
function buildListeningSpeakingSlides(topic, subject, grade, book, textbookContent) {
  const sentences = splitEnglishSentences(textbookContent);
  const places = [
    { word: 'bank', cn: '银行', use: 'take out some money in the bank' },
    { word: 'restaurant', cn: '餐馆', use: 'eat different kinds of food in the restaurant' },
    { word: 'hotel', cn: '旅馆', use: 'stay for a vacation in the hotel' },
    { word: 'post office', cn: '邮局', use: 'send a letter in the post office' },
    { word: 'hospital', cn: '医院', use: 'go to see a doctor in the hospital' },
    { word: 'police station', cn: '警察局', use: "ask for police's help in the police station" },
  ];
  const prepositions = [
    { en: 'on', cn: '在...上面', example: "It's on Green Street." },
    { en: 'next to', cn: '紧挨着', example: "It's next to the library." },
    { en: 'between...and...', cn: '在...和...之间', example: "It's between the library and the post office." },
    { en: 'in front of', cn: '在...前面', example: "It's in front of the library." },
    { en: 'across from', cn: '在...正对面', example: "It's across from the library." },
  ];
  // 教材中提取真实地名
  const streets = (textbookContent.match(/\b[A-Z][a-z]+ (?:Street|Road|Avenue)\b/g) || ['Longyan Street', 'Zhongshan Road', 'Bingang Street']).slice(0, 3);
  // 教材中提取真实场所词（若课文提到）
  const textbookPlaces = places.filter(p => (textbookContent || '').toLowerCase().includes(p.word));

  const slides = [
    { component: 'cover', title: topic, subtitle: `${subject} · ${grade} · ${book}`, content: ['听说课 Listening & Speaking', `今天我们将一起学习"${topic}"`], narrative: `同学们好，今天是一节英语听说课。`, goal: '引入课题', emotion: '好奇' },
    { component: 'warmup', title: '情境建立 Lead-in', content: [
      `外国学生 Mike 想了解学校周边 neighborhood，你如何向他介绍？`,
      `How do we tell Mike about our school neighborhood?`,
      `今天我们一起学习用英语描述社区场所。`,
    ], narrative: `我们先建立一个情境：一位外国朋友想了解我们的学校周边。`, goal: '建立真实情境，明确任务', emotion: '期待' },
    { component: 'vocabulary', title: '场所词汇 Places', content: places.map(p => `· ${p.word} ${p.cn}`), narrative: `先认识本课的核心场所词汇。`, goal: '掌握 6 个场所词汇', emotion: '专注' },
    { component: 'grammar', title: '核心句型 Key Sentences', content: [
      `Is there a ___ on ___ Street/Road?`,
      `Are there any ___s on...?`,
      `Yes, there is/are. / No, there isn't/aren't.`,
      `There is a ___ near here. We can ___.`,
    ], narrative: `这些是本课的核心句型。`, goal: '掌握询问与描述场所句型', emotion: '思考' },
    { component: 'knowledge', title: '句型操练 1 · 听判断+匹配', goal: '建立场所词汇', content: [
      `听力任务：put a √ if we have the place, put an × if we don't.`,
      `匹配：听录音把场所与位置连起来。`,
      ...places.slice(0, 6).map(p => `${p.word} → ${p.use}`),
    ], narrative: `第一遍听力，判断学校周边有哪些场所。`, emotion: '专注' },
    ...places.map((p, i) => ({
      component: 'knowledge', title: `句型操练 · ${p.word}`, goal: '用 There is... We can... 造句', content: [
        `There is a ${p.word} near here.`,
        `We can ${p.use}.`,
        `看图说句子：看到场所图标，用句型描述。`,
      ], narrative: `我们来练习描述"${p.cn}"。`, emotion: '专注'
    })),
    { component: 'practice', title: '听力任务 2 · 对话补全', goal: '巩固询问句型', content: [
      `Listen and speak out:`,
      `A: Is there a ___ on Bridge Street?`,
      `B: Yes, there is.`,
      `A: Is there a ___ near here?`,
      `B: Um, yes, there is.`,
    ], narrative: `第二遍听力，补全对话。`, emotion: '挑战' },
    { component: 'practice', title: 'Pair work · 完成地图', goal: '用 Is there... 问答', content: [
      `Is there a ___ on ___ Street/Road?`,
      `Are there any ___s on...?`,
      `两人一组，互相问答完成地图（限时 2 分钟）。`,
    ], narrative: `两人一组，用句型互相问答。`, emotion: '合作' },
    { component: 'game', title: 'Chain Game 接龙', goal: '巩固 there be 就近原则', content: [
      `1. There is a supermarket on ${streets[0] || 'Longyan Street'}.`,
      `2. There is a supermarket and two banks on ${streets[0] || 'Longyan Street'}.`,
      `3. There is a supermarket, two banks and...`,
      `⚠️ 就近原则 principle of proximity：there be 与最近的名词一致。`,
    ], narrative: `我们来玩接龙游戏，注意 there be 的就近原则。`, emotion: '兴奋' },
    { component: 'grammar', title: '方位介词 Prepositions', goal: '掌握方位介词', content: prepositions.map(p => `${p.en} ${p.cn} — ${p.example}`), narrative: `这些是描述位置关系的方位介词。`, emotion: '专注' },
    { component: 'practice', title: '听力任务 3 · 听填空', goal: '巩固方位介词', content: [
      `Where is the pay phone?`,
      `1. The police station is ___ the restaurant and the ___.`,
      `2. The park is ___ the bank.`,
      `3. The hospital is ___ Green Street.`,
    ], narrative: `听录音，填入方位介词。`, emotion: '挑战' },
    { component: 'game', title: 'Memory Test 记忆挑战', goal: '训练快速记忆', content: [
      `-- Is/Are there... on...?`,
      `-- Where...?`,
      `看地图 10 秒，然后回答老师提问（限时 1 分钟）。`,
    ], narrative: `我们来做记忆挑战！`, emotion: '兴奋' },
    { component: 'game', title: 'Group work 小组设计社区', goal: '综合运用，合作产出', content: [
      `任务：What neighborhood do you want? 设计你理想的社区。`,
      `分工：ask 提问 / answer 回答 / reporter 报告者 / designer 制作者`,
      `限时 10 分钟，画出社区地图并用英语介绍。`,
    ], narrative: `小组合作，设计你们理想的社区。`, emotion: '合作' },
    { component: 'summary', title: 'Summary 总结', content: [`6 个场所：${places.map(p => p.word).join(' / ')}`, `方位介词：${prepositions.map(p => p.en).join(' / ')}`, `核心句型：There is/are... / Is there...?`], narrative: `我们回顾今天所学。`, goal: '梳理知识框架', emotion: '满足' },
    { component: 'homework', title: '课后作业 Homework', content: ['必做：用 There is/are 写 3 句介绍校园周边场所', '必做：用方位介词描述 5 个场所的位置', '选做：设计你理想中的社区（画地图+写英文介绍）'], narrative: `这是今天的作业。`, goal: '巩固拓展', emotion: '鼓励' },
  ];
  return { slides, pages: 15 + places.length + 2 };
}

function generateTopicAwareContent(topic, subject, grade, book, lessonType, lessonPeriod, textbookContent, templateStyle) {
  const tc = textbookContent ? textbookContent.substring(0, 400) : '';
  const a = analyzeTextbook(textbookContent, topic);
  const has = a.hasContent;
  const t1 = a.keyTerms[0] || topic;

  // ── 郑佳情境听说课范式（Unit 8 方位问路课） ──
  if (templateStyle === 'zhengjia-listening' || /听说|方位|问路|Is there a/i.test(topic + ' ' + (subject || ''))) {
    const enhanced = buildListeningSpeakingSlides(topic, subject, grade, book, textbookContent);
    const objectives = [
      '能听懂并谈论场所位置（Is there a...? / Where is...?）',
      '掌握 6 个场所词汇：bank / restaurant / hotel / post office / hospital / police station',
      '掌握方位介词：on / next to / between / in front of / across from',
      '能运用 There is/are 句型描述社区，完成小组社区设计',
    ];
    const class_flow = [
      { time: '5分钟', phase: '情境建立', desc: '外国学生探访校园周边，引出本课任务', icon: '情境' },
      { time: '8分钟', phase: '听力输入', desc: '听判断+匹配，建立场所词汇', icon: '听力' },
      { time: '10分钟', phase: '句型操练', desc: 'There is... We can... 六场所逐一练', icon: '操练' },
      { time: '10分钟', phase: '合作游戏', desc: 'Pair work + Chain Game + Memory Test', icon: '游戏' },
      { time: '7分钟', phase: '小组产出', desc: '设计理想社区并展示', icon: '产出' },
    ];
    const teacher_guide = [
      { page_number: 1, teacher_script: `【导入】用单元情境引入：外国学生 Mike 想了解学校周边 neighborhood，问学生如何向他介绍。`, student_activity: '观看情境图，讨论如何介绍学校周边', time_allocation: '5分钟', questions: [{ question: 'How do we tell Mike about our school neighborhood?', expected_answer: '用 There is/are 句型介绍场所' }] },
      { page_number: 2, teacher_script: '【听力】播放听力，学生判断 √/× 并匹配场所，建立 6 个场所词汇。', student_activity: '听录音，判断+匹配场所', time_allocation: '8分钟', questions: [{ question: 'Which places are near our school?', expected_answer: 'bank/restaurant/hotel 等' }] },
      { page_number: 3, teacher_script: '【操练】用 There is a ___ near here. We can ___. 逐一操练 6 个场所。', student_activity: '跟读+看图造句', time_allocation: '10分钟', questions: [{ question: 'What can we do in the bank?', expected_answer: 'take out some money' }] },
      { page_number: 4, teacher_script: '【游戏】组织 Chain Game 接龙（there be 就近原则）与 Memory Test。', student_activity: '参加接龙游戏与记忆挑战', time_allocation: '10分钟', questions: [{ question: 'Is there a supermarket on Longyan Street?', expected_answer: 'Yes, there is.' }] },
      { page_number: 5, teacher_script: '【产出】小组设计理想社区，分工 ask/answer/reporter/designer，限时10分钟。', student_activity: '小组合作设计并展示社区', time_allocation: '7分钟', questions: [{ question: 'What neighborhood do you want?', expected_answer: '设计并介绍理想社区' }] },
    ];
    const games = [
      { name: 'Chain Game 接龙', type: '词汇接龙', phase: '练习巩固', duration: '1分钟', description: '第1人"There is a supermarket on Longyan Street."，下一个人累加"and two banks..."，训练 there be 就近原则。', materials: ['地图'], learning_goal: '巩固 There is/are 就近原则' },
      { name: 'Memory Test', type: '记忆挑战', phase: '巩固', duration: '3分钟', description: '快速记忆地图后回答 Is/Are there...? Where...?', materials: ['地图'], learning_goal: '训练快速记忆与句型输出' },
      { name: 'Group work', type: '小组设计', phase: '输出', duration: '10分钟', description: '小组设计理想社区，分工 ask/answer/reporter/designer，制作社区地图并展示。', materials: ['白纸', '彩笔'], learning_goal: '综合运用场所词汇与方位介词' },
    ];
    const homework = [
      { tier: '基础', title: '用 There is/are 写 3 句介绍校园周边场所', estimated_time: '10分钟', difficulty: '★☆☆' },
      { tier: '拓展', title: '用方位介词描述 5 个场所的位置关系', estimated_time: '15分钟', difficulty: '★★☆' },
      { tier: '实践', title: '设计你理想中的社区（画地图+写英文介绍）', estimated_time: '20分钟', difficulty: '★★☆' },
    ];
    const theme_elevation = {
      core_value: '热爱自己的社区，乐于助人',
      format: '教师总结 + 学生分享',
      duration: '2分钟',
      content: `引导学生回顾本课学会的场所词汇与方位表达，感受社区生活的便利与温暖，鼓励用英语帮助他人（如为外国朋友指路）。`,
    };
    return { objectives, class_flow, teacher_guide, games, homework, theme_elevation, ...enhanced };
  }

  // ── 英语课文且教材内容非空 → 走阅读课增强教学环节 ──
  const subjLow = (subject || '').toLowerCase();
  if ((subjLow.includes('英语') || subjLow.includes('english')) && (textbookContent || '').trim()) {
    const enhanced = buildEnglishReadingSlides(topic, subject, grade, book, a, textbookContent);
    const objectives = buildObjectives(topic, a);
    const class_flow = [
      { time: '5分钟', phase: '情境导入', desc: '预测文章内容，激活背景知识', icon: '导入' },
      { time: '8分钟', phase: '快速阅读', desc: '速读抓主旨大意，完成大意题', icon: '阅读' },
      { time: '12分钟', phase: '精读细读', desc: '逐段精读，理解细节与重点句式', icon: '精读' },
      { time: '10分钟', phase: '练习检测', desc: '读后检测，合作讨论课文细节', icon: '练习' },
      { time: '5分钟', phase: '总结升华', desc: '梳理文章结构，升华主题', icon: '总结' },
    ];
    const teacher_guide = [
      { page_number: 1, teacher_script: `【导入】用预测活动引入课题"${topic}"，让学生看标题和插图猜文章内容。`, student_activity: '预测、讨论文章主题', time_allocation: '5分钟', questions: [{ question: `关于"${topic}"你猜文章会讲什么？`, expected_answer: '结合标题与生活经验预测' }] },
      { page_number: 2, teacher_script: `【快读】限时3分钟快速浏览，找出主旨大意。${a.questions.length ? '展示问题：' + a.questions[0] : ''}`, student_activity: '快速浏览，抓主旨', time_allocation: '8分钟', questions: [{ question: '文章的主旨大意是什么？', expected_answer: '用一句话概括' }] },
      { page_number: 3, teacher_script: `【精读】逐段精读，讲解重点句式与词汇。核心内容：${(a.highlights.slice(0, 2) || []).join('；')}`, student_activity: '精读课文，划重点句式', time_allocation: '12分钟', questions: [{ question: '文章中的关键信息有哪些？', expected_answer: '找出支撑细节' }] },
      { page_number: 4, teacher_script: '【检测】做读后检测题，两人一组互相提问课文细节。', student_activity: '完成练习，合作问答', time_allocation: '10分钟', questions: [{ question: '读后检测：你掌握了哪些内容？', expected_answer: '运用课文知识作答' }] },
      { page_number: 5, teacher_script: `【总结】梳理文章结构，升华主题。重点：${t1}`, student_activity: '回顾总结，记录作业', time_allocation: '5分钟', questions: [] },
    ];
    return { objectives, class_flow, teacher_guide, games: [], homework: [], theme_elevation: { core_value: `理解"${topic}"的主题意义`, format: '教师总结 + 学生分享', duration: '3分钟', content: `回顾"${topic}"带给我们的启示，联系生活实际。` }, ...enhanced };
  }

  // ── 学习目标 / 课堂流程（喂给 pptx.js 的 addObjectives / addFlow） ──
  const objectives = buildObjectives(topic, a);
  const class_flow = buildClassFlow(topic, a);

  // ── 知识点内容页 ──
  const knowledgeSlides = [];
  if (has) {
    a.definitions.forEach((d, i) => {
      knowledgeSlides.push({
        component: 'knowledge',
        title: `${d.term}`,
        goal: '掌握核心概念',
        content: [d.def],
        narrative: `接下来我们重点认识"${d.term}"。${d.def}`,
        emotion: '专注',
      });
    });
    a.highlights.slice(0, 3).forEach((h, i) => {
      knowledgeSlides.push({
        component: 'knowledge',
        title: `${topic}要点 ${i + 1}`,
        goal: '梳理关键信息',
        content: h.length > 90 ? [h.slice(0, 90) + '…'] : [h],
        narrative: `这一要点很关键，请大家做好标记：${h.slice(0, 48)}…`,
        emotion: '思考',
      });
    });
  } else {
    generateSlideContent(topic, subject, grade, '').slice(1, 6).forEach((t, i) => {
      knowledgeSlides.push({
        component: 'knowledge',
        title: t.title,
        goal: '知识梳理',
        content: t.points.slice(0, 4),
        narrative: t.title,
        emotion: '专注',
      });
    });
  }

  const exampleSlides = a.examples.slice(0, 3).map((ex, i) => ({
    component: 'example',
    title: `典型示例 ${i + 1}`,
    goal: '通过实例理解应用',
    content: ex.length > 90 ? [ex.slice(0, 90) + '…'] : [ex],
    narrative: `我们一起来看这个例子，思考它如何体现"${topic}"的知识：${ex.slice(0, 40)}…`,
    emotion: '思考',
  }));

  const practiceSlides = a.questions.slice(0, 4).map((q, i) => ({
    component: 'practice',
    title: `课堂探究 ${i + 1}`,
    goal: '运用知识，深化理解',
    content: [q],
    narrative: `请认真思考这个问题：${q}`,
    emotion: '挑战',
  }));

  const vocabContent = a.definitions.length
    ? a.definitions.slice(0, 4).map(d => `${d.term}：${d.def}`)
    : (has
      ? a.highlights.slice(0, 4).map(h => '· ' + h)
      : [`${topic}的核心概念1`, `${topic}的核心概念2`, `${topic}的核心概念3`]);

  // ── 课堂互动游戏（优先用真实概念） ──
  const games = a.hasContent ? [
    { name: `${t1}知识闯关`, type: '小组竞赛', phase: '练习巩固', duration: '8分钟',
      description: a.definitions.length
        ? `将全班分为4组，围绕"${a.definitions.slice(0, 3).map(d => d.term).join('""')}"等核心概念出5-8道抢答题（如"XX指什么"）。答对+2分，答错其他组可补答+1分。积分最高的组获得"课堂之星"称号。`
        : `将全班分为4组，围绕"${topic}"核心知识出5-8道抢答题。答对+2分，答错其他组可补答+1分。积分最高的组获得"课堂之星"称号。`,
      materials: ['题板', '计分牌', '抢答铃'], learning_goal: `巩固"${topic}"的核心知识点` },
    { name: `${topic}探究竞答`, type: '互动游戏', phase: '合作学习', duration: '5分钟',
      description: a.questions.length
        ? `教师展示教材探究题"${a.questions[0].slice(0, 20)}…"，学生两人一组限时讨论作答，之后邀请2-3组展示，师生共同点评。`
        : `学生两人一组，围绕"${topic}"的主题进行情景模拟，之后邀请2-3组上台展示，师生共同点评。`,
      learning_goal: `运用"${topic}"所学进行实际交流和表达` },
  ] : [
    { name: `${topic}知识闯关`, type: '小组竞赛', phase: '练习巩固', duration: '8分钟',
      description: `将全班分为4组，围绕"${topic}"核心知识出5-8道抢答题。答对+2分，答错其他组可补答+1分。积分最高的组获得"课堂之星"称号。`,
      materials: ['题板', '计分牌', '抢答铃'], learning_goal: `巩固"${topic}"的核心知识点` },
    { name: `${topic}角色扮演`, type: '互动游戏', phase: '合作学习', duration: '5分钟',
      description: `学生两人一组，围绕"${topic}"的主题进行角色扮演对话或情景模拟，之后邀请2-3组上台展示，师生共同点评。`,
      learning_goal: `运用"${topic}"所学进行实际交流和表达` },
  ];

  // ── 分层作业（优先用真实内容） ──
  const homework = a.hasContent ? [
    { tier: '基础', title: `用一句话复述"${t1}"的定义并完成课后基础练习`, estimated_time: '10分钟', difficulty: '★☆☆' },
    ...(a.examples.length
      ? [{ tier: '拓展', title: `仿照教材"${a.examples[0].slice(0, 16)}…"的示例，编写一个与"${t1}"相关的实例`, estimated_time: '15分钟', difficulty: '★★☆' }]
      : [{ tier: '拓展', title: `运用"${t1}"的知识解决一个生活中的实际问题，写下简要思路`, estimated_time: '15分钟', difficulty: '★★☆' }]),
    ...(a.questions.length
      ? [{ tier: '实践', title: `思考教材探究问题"${a.questions[0].slice(0, 18)}…"，与同伴交流你的答案`, estimated_time: '10分钟', difficulty: '★★☆' }]
      : [{ tier: '实践', title: `向家人或同学介绍"${topic}"的核心内容，记录他们的反馈`, estimated_time: '10分钟', difficulty: '★★☆' }]),
  ] : [
    { tier: '基础', title: `完成"${topic}"课后练习题`, estimated_time: '10分钟', difficulty: '★☆☆' },
    { tier: '拓展', title: `用"${topic}"的知识解决一个生活中的实际问题，写下简要思路`, estimated_time: '15分钟', difficulty: '★★☆' },
    { tier: '实践', title: `向家人或同学介绍"${topic}"的核心内容，记录他们的反馈`, estimated_time: '10分钟', difficulty: '★★☆' },
  ];

  // ── 主题升华 ──
  const theme_elevation = a.hasContent && a.examples.length ? {
    core_value: `理解"${t1}"的内涵，体会"${topic}"在生活中的意义`,
    format: '教师总结 + 学生分享',
    duration: '3分钟',
    content: `教师带领学生回顾本节课的核心概念"${t1}"，结合教材实例"${a.examples[0].slice(0, 24)}…"总结"${topic}"的实际价值。鼓励学生分享自己的理解和感悟，体会知识来源于生活、服务于生活，激发持续学习的热情。`
  } : {
    core_value: `理解"${topic}"的意义，学以致用`,
    format: '教师总结 + 学生分享',
    duration: '3分钟',
    content: `教师引导学生思考"${topic}"在生活中的应用，鼓励学生分享自己的理解和感悟。总结本节课的核心价值——知识来源于生活，服务于生活，激发持续学习的热情。`
  };

  // ── 教师用教案 ──
  const teacher_guide = [
    {
      page_number: 1,
      teacher_script: has && a.questions.length
        ? `【情境导入】用问题"${a.questions[0]}"切入课题，追问学生对"${topic}"的了解，引导学生联系生活经验，自然进入新课。`
        : `【情境导入】展示与"${topic}"相关的图片或短视频，提问：关于"${topic}"你了解什么？引导学生联系生活经验，自然进入新课。`,
      student_activity: '观看素材，积极思考并回答问题，分享已知知识',
      time_allocation: '5分钟',
      questions: (a.questions.length ? a.questions.slice(0, 2) : [`看到"${topic}"这个课题，你最先想到什么？`]).map(q => ({ question: q, expected_answer: `结合"${topic}"核心知识回答` }))
    },
    {
      page_number: 2,
      teacher_script: `【知识讲解】围绕核心概念"${t1}"展开系统讲解。${tc ? '结合教材内容：「' + tc + '」' : ''}通过板书和举例，帮助学生理解关键概念。`,
      student_activity: '认真听讲，做课堂笔记，跟随教师思路思考',
      time_allocation: '12分钟'
    },
    {
      page_number: 3,
      teacher_script: has && a.examples.length
        ? `【合作探究】组织小组研读教材实例"${a.examples[0].slice(0, 28)}…"，讨论其中体现的知识点，巡视各组并给予针对性指导。`
        : `【合作探究】组织小组讨论"${topic}"相关任务。巡视各组，给予针对性指导，鼓励学生互相交流。`,
      student_activity: '小组分工合作，讨论交流，记录讨论结果',
      time_allocation: '10分钟',
      questions: [{ question: `小组讨论：如何运用"${topic}"的知识？`, expected_answer: `${topic}知识的实际应用场景` }]
    },
    {
      page_number: 4,
      teacher_script: has && a.questions.length
        ? `【练习巩固】用教材探究题"${a.questions[0].slice(0, 24)}…"进行当堂检测，检验学生掌握情况，对共性错误集中讲解。`
        : `【练习巩固】布置"${topic}"相关的练习题，检验学生掌握情况。对共性错误集中讲解，个别问题单独辅导。`,
      student_activity: '独立完成练习，自检互评，查漏补缺',
      time_allocation: '8分钟',
      questions: [{ question: '这道题的关键解题思路是什么？', expected_answer: `运用${topic}的核心知识点分析解决` }]
    },
    {
      page_number: 5,
      teacher_script: `【课堂总结】引导学生回顾"${topic}"的核心内容${has ? `（重点概念：${t1}）` : ''}，总结知识结构，布置课后作业，预告下节课内容。`,
      student_activity: '回顾梳理本节课知识点，记录课后作业',
      time_allocation: '5分钟'
    },
  ];

  // ── 可编辑 slides（pptx.js 渲染：knowledge/example/practice/vocabulary/grammar 会渲染为内容页） ──
  const slides = [
    { component: 'cover', title: topic, subtitle: `${subject} · ${grade} · ${book}`, content: has && a.questions.length ? [a.questions[0], `今天我们将一起学习"${topic}"`] : [`今天我们将一起学习"${topic}"`, '请同学们思考：关于这个课题你已经知道什么？'], narrative: has && a.questions.length ? `同学们好，今天的学习从一个问题开始：${a.questions[0]}` : `同学们好，今天我们将学习"${topic}"。让我们一起探索这个精彩的课题。`, goal: '引入课题，激发学习兴趣', emotion: '好奇' },
    { component: 'warmup', title: `热身：认识"${topic}"`, content: a.questions.length ? a.questions.slice(0, 2) : [`讨论：提到"${topic}"你想到什么？`, '观看相关图片/视频素材'], narrative: `在开始正式学习之前，我们先来热热身。关于"${topic}"，你们已经知道些什么呢？`, goal: '激活已有知识，建立新旧联系', emotion: '期待' },
    { component: 'vocabulary', title: `${topic}核心知识`, content: vocabContent, narrative: `现在我们进入"${topic}"的核心知识学习，请认真听讲，做好笔记。`, goal: '掌握核心知识点', emotion: '专注' },
    { component: 'grammar', title: `${topic}重点解析`, content: a.formulas.length ? a.formulas : [`${topic}的重点内容`, `典型例题分析`], narrative: `接下来我们重点分析"${topic}"中的核心内容和典型例题。`, goal: '深入理解重点难点', emotion: '思考' },
    ...knowledgeSlides.slice(0, 6),
    ...exampleSlides,
    ...practiceSlides,
    { component: 'game', title: `${topic}互动游戏`, content: [games[0].description], narrative: `学完了知识，我们来做一个互动游戏巩固一下！${games[0].name}`, goal: '在游戏中巩固知识', emotion: '兴奋' },
    { component: 'summary', title: '课堂总结', content: [`回顾"${topic}"的核心内容`, theme_elevation.content], narrative: `今天我们学习了"${topic}"，让我们一起回顾一下这节课的重点内容。`, goal: '梳理知识框架，升华主题', emotion: '满足' },
    { component: 'homework', title: '课后作业', content: homework.map(h => `${h.tier}：${h.title}（${h.estimated_time}）`), narrative: `这是今天的课后作业，请大家按时完成。`, goal: '巩固拓展所学知识', emotion: '鼓励' },
  ];

  const contentCount = Math.min(slides.filter(s => !['cover', 'warmup', 'game', 'summary', 'homework', 'vocabulary'].includes(s.component)).length, 8);
  const pages = 3 + contentCount + (games.length ? 1 : 0) + (homework.length ? 1 : 0) + 1;

  return { objectives, class_flow, teacher_guide, games, homework, theme_elevation, slides, pages };
}

async function runMockPipeline(topic, subject, grade, book, lessonType, lessonPeriod, textbookContent, images, apiKey, taskId, templateStyle) {
  let _lastLlmText = '';

  const result = {
    topic, file_name: topic + '_备课方案',
    template_style: templateStyle || 'story-magic',
    meta: { subject, grade, book, lesson_type: lessonType, lesson_period: lessonPeriod },
    ...generateTopicAwareContent(topic, subject, grade, book, lessonType, lessonPeriod, textbookContent, templateStyle)
  };

  // 无 API Key → 用规则模板
  if (!apiKey) {
    TASKS[taskId] = { status: 'done', step: 13, step_name: '备课完成（规则模板）', topic, result };
    return;
  }

  // 推进 13 智能体步骤展示（快速点亮）
  const stepNames = [
    '📚 教材分析Agent - 分析教材知识结构、重难点',
    '🎯 学习目标Agent - 生成知识目标、能力目标、素养目标',
    '🧠 学情诊断Agent - 预测学生困难和错误概念',
    '🎬 情境创设Agent - 生成视频、图片、游戏导入',
    '🧩 任务链Agent - 设计由易到难的学习任务链',
    '🌈 主题升华Agent - 设计价值引领与情感升华',
    '👨‍🏫 教学流程Agent - 生成40分钟课堂流程安排',
    '🎮 游戏活动Agent - 设计课堂互动游戏与活动',
    '📝 评价设计Agent - 设计形成性评价与课堂反馈',
    '🎨 课件视觉Agent - 设计PPT版式、配色、动画',
    '🎙️ 多媒体资源Agent - 生成配图、动画、音频素材',
    '📋 作业设计Agent - 生成基础/拓展/实践分层作业',
    '🔍 质量审核Agent - 检查教学合理性与课标匹配',
  ];
  for (let i = 0; i < stepNames.length; i++) {
    TASKS[taskId] = { status: 'running', step: i + 1, step_name: stepNames[i], topic };
    await new Promise(r => setTimeout(r, 200));
  }

  // 单次 LLM 生成完整方案
  const isEnglishReading = /英语|english/i.test(subject) && (textbookContent || '').trim();
  const flowGuide = isEnglishReading ? `
【英语阅读课课堂流程（按此设计，共5步）】
1. 情境导入 Lead-in（5分钟）：预测/热身，激活背景
2. 快速阅读 Fast Reading（8分钟）：速读抓主旨
3. 精读细读 Close Reading（12分钟）：逐段理解细节与重点句式
4. 练习检测 Practice（10分钟）：读后检测/问答/小组讨论
5. 总结升华 Summary（5分钟）：梳理结构、升华主题` : `
【课堂流程（按此设计，共5步）】
1. 情境导入（5分钟）：创设情境，激发兴趣
2. 新知探究（10分钟）：讲解核心知识
3. 合作学习（15分钟）：小组协作深化理解
4. 练习巩固（10分钟）：当堂检测与反馈
5. 总结提升（5分钟）：梳理框架、升华主题`;

  const slidesGuide = isEnglishReading ? `
【slides 数组：英语阅读课专用环节（component 类型用以下之一）】
按顺序生成 14-20 个页面，component 取值：
- cover 封面（标题+副标题）
- warmup 读前预热（预测/讨论/关键词）
- vocabulary 词汇预习（6-8个核心词，中英对照）
- reading 课文速读（主旨大意/段落匹配）
- detail 精读理解（逐段细节+重点句）
- grammar 语言点（重点句型/语法讲解+例句）
- practice 练习（选择/填空/判断/问答，含参考答案思路）
- discussion 讨论（开放性话题+小组任务）
- writing 写作任务（话题+支架+连接词）
- summary 总结（结构梳理+主题升华）
- homework 作业（必做+选做）
每个 slide 结构：{component, title, content:[...]（文字要点数组）, narrative（教师口播语）, goal（教学目的）, emotion}
content 每项要具体、可上课用，避免空泛套话。` : `
【slides 数组：通用学科教学环节（component 类型用以下之一）】
按顺序生成 14-20 个页面，component 取值：
- cover 封面
- warmup 导入
- vocabulary 核心概念/词汇（若适用）
- knowledge 知识点讲解（每个重要知识点1页）
- example 典型例题/实例（每题1页含解析）
- practice 课堂练习（含答案/思路）
- discussion 合作探究
- summary 总结
- homework 作业
每个 slide 结构：{component, title, content:[...]（文字要点数组）, narrative（教师口播语）, goal（教学目的）, emotion}`;

  const textPrompt = `你是一位资深教师，正在备课。请严格基于下面的教材内容设计完整的备课方案，务必做到"每一页都能直接上课使用"。

⚠️ 所有内容必须以教材内容为准，不要编造知识点；英语课文要利用原文的真实句子。

【教材原文】
${textbookContent || '无教材原文，请根据课题名称设计'}

【基础信息】
学科：${subject}
年级：${grade}
教材：${book}
课型：${lessonType}
课时：${lessonPeriod || '整单元'}
课题：${topic}
${flowGuide}

请输出JSON格式（严格遵循，不要加markdown代码块标记），包含：
- pages: 课件页数（14-20页）
- objectives: 数组，4条学习目标（识记/理解/应用/素养，具体可衡量）
- class_flow: 数组，每项含 time/phase/desc/icon（课堂流程5步，按上述流程设计）
- teacher_guide: 数组，每项含 page_number/teacher_script/student_activity/time_allocation/questions（每页的教师教案，语言要具体有操作性）
- theme_elevation: 含 core_value/format/duration/content
- games: 数组，每项含 name/type/phase/duration/description/materials/learning_goal
- homework: 数组，每项含 tier(基础/拓展/实践)/title/estimated_time/difficulty
- slides: 数组（必须生成！这是PPTX内容页，直接影响课件质量）
${slidesGuide}`;

  // 进入 LLM 生成阶段（提示用户，避免误以为卡住）
  TASKS[taskId] = { status: 'running', step: 13, step_name: '🤖 AI 正在生成完整课件方案，请稍候...', topic };

  let parsed = null;
  try {
    const text = await Promise.race([
      callDeepSeek(apiKey, textPrompt, 3000),
      new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), 25000)),
    ]);
    _lastLlmText = text;
    parsed = extractJson(text);
  } catch (err) {
    result._llm_error = 'AI方案生成失败：' + (err?.message || String(err)).slice(0, 200);
  }

  if (parsed) {
    Object.assign(result, parsed);
    result._llm_ok = true;
    result._agents_run = 13;
  } else if (!result._llm_error) {
    result._llm_error = 'AI方案生成失败：返回内容无法解析为JSON，已退回规则模板。';
  }

  result._taskId = taskId;
  TASKS[taskId] = { status: 'done', step: 13, step_name: '✅ 备课完成', topic, result };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = getPath(url);
  const method = request.method;

  try {
    if (path === '/api/health') return json({ status: 'ok', app: 'AI PPT OS V3', version: '3.0.0' });

    if (path === '/api/users/login' && method === 'POST') {
      return json({ access_token: 'demo_token_' + Date.now(), token_type: 'bearer', user_id: 1 });
    }
    if (path === '/api/users/register' && method === 'POST') {
      return json({ id: 1, username: 'demo', access_token: 'demo_token_' + Date.now(), token_type: 'bearer' });
    }
    if (path === '/api/users/me') return json({ id: 1, username: 'demo', role: 'free' });

    if (path === '/api/templates') return json(TEMPLATES);
    const tMatch = path.match(/^\/api\/templates\/(.+)/);
    if (tMatch) {
      const t = TEMPLATES.find(x => x.id === tMatch[1]);
      return json(t || { error: 'Not found' }, t ? 200 : 404);
    }

    if (path === '/api/generate' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

      TASKS[taskId] = {
        status: 'running',
        step: 1,
        step_name: '📚 教材分析Agent - 分析教材知识结构、重难点',
        topic: body.topic || 'demo'
      };
      
      const pipeline = runMockPipeline(
        body.topic || '', body.subject || '', body.grade || '',
        body.book || '', body.lesson_type || '新授课',
        body.lesson_period || '', body.textbook_content || '',
        body.images || [], body.api_key, taskId, body.template_style
      );
      if (typeof context.waitUntil === 'function') {
        context.waitUntil(pipeline);
      }

      return json({ task_id: taskId, status: 'pending' });
    }

    // AI 生成单页课件内容（编辑器用）
    if (path === '/api/generate/slide' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { topic, subject, grade, page_type, page_label, context, api_key } = body;
      if (!page_type) return json({ error: 'page_type is required' }, 400);

      const pagePrompts = {
        cover: '封面页：设计本课标题与副标题（内容数组放1-2句主题语）',
        warmup: '热身导入页：设计1个趣味问题或情境导入，配引导语',
        vocabulary: '词汇页：列出本课核心词汇（每项格式"单词 释义"）',
        story: '故事页：用2-4句讲故事的核心情节',
        animation: '情景动画页：设计1-2个情景片段，配场景说明',
        grammar: '语法页：列出语法规则与例句（规则在前，例句在后）',
        reading: '读写页：设计阅读任务与写作提示',
        speaking: '口语页：设计角色扮演/对话任务',
        game: '游戏闯关页：设计1-3个游戏规则或闯关问题',
        summary: '总结页：梳理本课要点，升华主题',
        homework: '作业页：设计分层作业（基础/拓展/实践）',
        knowledge: '知识讲解页：讲解一个核心知识点',
        example: '例题讲解页：给一道典型例题和解析',
        practice: '练习页：出2-4道课堂练习',
        detail: '精读页：列出课文细节理解点',
        discussion: '讨论页：给一个开放讨论话题',
        writing: '写作页：给出写作任务与要点',
        review: '复习页：设计复习要点',
      };

      let result = null;
      if (api_key) {
        try {
          const prompt = `你是资深教师。请为课件「${topic}」（${subject} · ${grade}）的「${page_label || pagePrompts[page_type] || page_type}」页面生成内容。
${context ? '课件其他内容参考：' + context.slice(0, 500) : ''}

请输出 JSON（不要markdown代码块），格式：
{"title": "页面标题", "narrative": "教师引导语（1-2句）", "goal": "本页教学目标", "content": ["要点1", "要点2", ...]}
- title 简洁明确
- content 每项具体、可直接上课使用，2-5 项
- ${pagePrompts[page_type] || ''}`;
          const text = await callDeepSeek(api_key, prompt);
          result = extractJson(text);
        } catch { result = null; }
      }

      if (!result) {
        result = buildRuleSlide(topic, page_type, page_label);
      }

      return json({ success: true, ...result });
    }

    const statusMatch = path.match(/^\/api\/generate\/status\/(.+)/);
    if (statusMatch) {
      const task = TASKS[statusMatch[1]];
      if (!task) return json({ status: 'not_found' }, 404);
      return json(task);
    }

    // ---- 课件 CRUD (KV 持久化) ----

    if (path === '/api/lessons/template/default' && method === 'GET') {
      // 从 URL 参数读取自定义内容
      const topic = url.searchParams.get('topic') || '课程标题';
      const subject = url.searchParams.get('subject') || '学科';
      const grade = url.searchParams.get('grade') || '年级';
      return json({
        title: topic, subject, grade, textbook: '', unit: '',
        template_style: url.searchParams.get('style') || 'story-magic',
        slides: [
          { component: 'cover', title: topic, subtitle: subject + ' · ' + grade, content: ['导入内容'], narrative: '同学们好，今天我们学习' + topic, goal: '引入课题', emotion: '好奇' },
          { component: 'warmup', title: topic + ' 热身活动', content: ['活动1'], narrative: '先来热热身', goal: '激活背景知识', emotion: '期待' },
          { component: 'vocabulary', title: topic + ' 核心知识', content: ['知识点1', '知识点2'], narrative: '学习核心知识', goal: '掌握知识点', emotion: '专注' },
          { component: 'grammar', title: topic + ' 重点解析', content: ['重点内容', '例题'], narrative: '重点解析', goal: '深入理解', emotion: '思考' },
          { component: 'game', title: topic + ' 互动游戏', content: ['游戏规则'], narrative: '学完了玩个游戏', goal: '巩固知识', emotion: '兴奋' },
          { component: 'summary', title: '课堂总结', content: ['总结点'], narrative: '回顾今天的内容', goal: '梳理框架', emotion: '满足' },
          { component: 'homework', title: '课后作业', content: ['作业1'], narrative: '这是今天的作业', goal: '延伸学习', emotion: '鼓励' },
        ]
      });
    }

    if (path === '/api/lessons' && method === 'GET') {
      const ids = await env.LESSONS_KV.get('_index').then(r => r ? JSON.parse(r) : []).catch(() => []);
      const lessons = await Promise.all(ids.map(id => env.LESSONS_KV.get(id, { type: 'json' }).catch(() => null)));
      return json(lessons.filter(Boolean).sort((a, b) => b.created_at - a.created_at));
    }

    if (path === '/api/lessons' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const id = 'lesson_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      // 计算 slide_count（slides 数组或 content.slides 的页数）
      let slideCount = 0;
      if (Array.isArray(body.slides)) slideCount = body.slides.length;
      else if (body.content?.slides && Array.isArray(body.content.slides)) slideCount = body.content.slides.length;
      else if (body.content?.pages) slideCount = Number(body.content.pages) || 0;
      const lesson = { id, slide_count: slideCount, ...body, created_at: Date.now() };
      await env.LESSONS_KV.put(id, JSON.stringify(lesson));
      // Update index
      const ids = await env.LESSONS_KV.get('_index').then(r => r ? JSON.parse(r) : []).catch(() => []);
      ids.push(id);
      await env.LESSONS_KV.put('_index', JSON.stringify(ids));
      return json(lesson, 201);
    }

    const lessonMatch = path.match(/^\/api\/lessons\/(.+)/);
    if (lessonMatch) {
      const lid = lessonMatch[1];
      if (method === 'GET') {
        const lesson = await env.LESSONS_KV.get(lid, { type: 'json' }).catch(() => null);
        return lesson ? json(lesson) : json({ error: 'Not found' }, 404);
      }
      if (method === 'DELETE') {
        const lesson = await env.LESSONS_KV.get(lid, { type: 'json' }).catch(() => null);
        if (!lesson) return json({ error: 'Not found' }, 404);
        await env.LESSONS_KV.delete(lid);
        // Update index
        const ids = await env.LESSONS_KV.get('_index').then(r => r ? JSON.parse(r) : []).catch(() => []);
        await env.LESSONS_KV.put('_index', JSON.stringify(ids.filter(i => i !== lid)));
        return json({ ok: true });
      }
      if (method === 'PUT') {
        const existing = await env.LESSONS_KV.get(lid, { type: 'json' }).catch(() => null);
        if (!existing) return json({ error: 'Not found' }, 404);
        const body = await request.json().catch(() => ({}));
        const updated = { ...existing, ...body };
        await env.LESSONS_KV.put(lid, JSON.stringify(updated));
        return json(updated);
      }
    }

    // 下载备课方案
    const dlMatch = path.match(/^\/api\/download\/(.+)/);
    if (dlMatch) {
      const taskId = dlMatch[1].replace(/\.(pptx|ppt)$/, '');
      const task = TASKS[taskId];
      if (!task || !task.result) {
        return json({ error: '任务不存在或已完成' }, 404);
      }
      try {
        const { generatePptx } = await import('./lib/pptx.js');
        const buf = await generatePptx(task.result, task.topic, task.result && task.result.template_style);
        return new Response(buf, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(task.topic)}_备课方案.pptx"`
          }
        });
      } catch (e) {
        return json({ error: 'PPTX生成失败: ' + e.message }, 500);
      }
    }

    // OCR: 拍照识别教材文字
    if (path === '/api/generate/ocr' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { image, api_key, subject, grade, book } = body;
      if (!image) return json({ error: 'No image provided' }, 400);

      let text = '';
      if (api_key) {
        try {
          const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api_key}` },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: '请完整提取这张教材图片中的所有文字内容（中文和英文），保持原文的段落结构和格式，不要添加任何解释或补充。如果图片模糊或无法识别，请回复"图片无法识别"。' },
                  { type: 'image_url', image_url: { url: image } }
                ]
              }],
              temperature: 0.1,
              max_tokens: 4096
            })
          });
          const data = await resp.json();
          text = data.choices?.[0]?.message?.content || '';
        } catch (e) {
          return json({ error: 'OCR识别失败: ' + e.message }, 500);
        }
      }

      const entry = { id: Date.now().toString(), text, subject, grade, book, timestamp: new Date().toISOString() };
      TEXTBOOK_DB.push(entry);

      return json({ text, id: entry.id });
    }

    // ─── 讯飞智能PPT生成 ───

    // 创建PPT任务
    if (path === '/api/xfyun/create' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const query = (body.query || '').trim();
      if (!query) return json({ error: '请提供PPT主题（query）' }, 400);
      try {
        const result = await xfyunCreatePPT(env, query, {
          templateId: body.templateId,
          author: body.author,
          isCardNote: body.isCardNote,
          aiImage: body.aiImage,
          isFigure: body.isFigure,
          search: body.search,
          language: body.language || 'cn'
        });
        if (!result.flag) {
          return json({ error: result.desc || '讯飞创建失败', detail: result }, 502);
        }
        const sid = result.data?.sid;
        if (sid) {
          XFYUN_TASKS[sid] = {
            sid, query,
            title: result.data?.title,
            subTitle: result.data?.subTitle,
            createdAt: Date.now(),
            status: 'running'
          };
        }
        return json({ ok: true, sid, title: result.data?.title, subTitle: result.data?.subTitle });
      } catch (e) {
        if (e.code === 'NO_CREDENTIALS') return json({ error: e.message }, 500);
        return json({ error: '讯飞API调用异常: ' + e.message }, 502);
      }
    }

    // 查询PPT生成进度
    if (path === '/api/xfyun/progress' && method === 'GET') {
      const sid = url.searchParams.get('sid');
      if (!sid) return json({ error: '缺少 sid 参数' }, 400);
      try {
        const result = await xfyunGetProgress(env, sid);
        if (!result.flag) {
          return json({ error: result.desc || '查询进度失败', detail: result }, 502);
        }
        const data = result.data || {};
        if (XFYUN_TASKS[sid]) {
          XFYUN_TASKS[sid].status = data.pptStatus;
          if (data.pptStatus === 'done') {
            XFYUN_TASKS[sid].pptUrl = data.pptUrl;
            XFYUN_TASKS[sid].totalPages = data.totalPages;
          }
        }
        return json({
          ok: true, sid,
          pptStatus: data.pptStatus,
          donePages: data.donePages || 0,
          totalPages: data.totalPages || 0,
          pptUrl: data.pptUrl || null,
          errMsg: data.errMsg || null
        });
      } catch (e) {
        if (e.code === 'NO_CREDENTIALS') return json({ error: e.message }, 500);
        return json({ error: '讯飞API调用异常: ' + e.message }, 502);
      }
    }

    // 生成大纲（不生成完整PPT）
    if (path === '/api/xfyun/outline' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const query = (body.query || '').trim();
      if (!query) return json({ error: '请提供主题（query）' }, 400);
      try {
        const result = await xfyunCreateOutline(env, query, { language: body.language || 'cn' });
        if (!result.flag) {
          return json({ error: result.desc || '大纲生成失败', detail: result }, 502);
        }
        return json({ ok: true, data: result.data });
      } catch (e) {
        if (e.code === 'NO_CREDENTIALS') return json({ error: e.message }, 500);
        return json({ error: '讯飞API调用异常: ' + e.message }, 502);
      }
    }

    // 获取讯飞PPT模板列表
    if (path === '/api/xfyun/templates' && method === 'GET') {
      try {
        const result = await xfyunGetTemplates(env, {
          style: url.searchParams.get('style') || '',
          pageSize: parseInt(url.searchParams.get('pageSize') || '10')
        });
        return json(result);
      } catch (e) {
        if (e.code === 'NO_CREDENTIALS') return json({ error: e.message }, 500);
        return json({ error: '讯飞API调用异常: ' + e.message }, 502);
      }
    }

    // 查询教材库
    if (path === '/api/textbooks' && method === 'GET') {
      const { searchParams } = url;
      let results = [...TEXTBOOK_DB];
      if (searchParams.get('subject')) results = results.filter(e => e.subject === searchParams.get('subject'));
      if (searchParams.get('grade')) results = results.filter(e => e.grade === searchParams.get('grade'));
      if (searchParams.get('book')) results = results.filter(e => e.book === searchParams.get('book'));
      return json(results.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    }

    // ---- 阅卷 API ----

    if (path === '/api/grading/tasks' && method === 'GET') {
      return json(Object.values(GRADING_TASKS).sort((a, b) => b.created_at - a.created_at));
    }

    if (path === '/api/grading/stats' && method === 'GET') {
      const all = Object.values(GRADING_TASKS);
      const total_tasks = all.length;
      const completed_tasks = all.filter(t => t.status === 'completed').length;
      const total_sheets = all.reduce((s, t) => s + t.total_sheets, 0);
      return json({ total_tasks, completed_tasks, total_sheets });
    }

    if (path === '/api/grading/upload' && method === 'POST') {
      const taskId = 'grading_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      let body;
      try { body = await request.json(); } catch {
        return json({ error: '表单解析失败，请确认上传格式正确' }, 400);
      }
      const title = body.title || ('本地阅卷 - ' + new Date().toLocaleString('zh-CN'));
      const subject = body.subject || '';
      const grade_level = body.grade_level || '';
      const standardAnswers = body.standard_answers || '';
      const files = (body.files || []).filter(f => f && f.data);
      const answerKeyData = body.answer_key?.data || null;

      if (!files.length) return json({ error: '请至少上传一个文件' }, 400);

      // 解析标准答案
      const parsedAnswers = standardAnswers.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const m = l.match(/^(\d+)[.、]\s*(.+?)(?:\s+(\d+)\s*分)?(?:\s*[\[【（(]?\s*(客观|主观|客|主)\s*[\]】）)]?)?$/);
        return m ? { num: parseInt(m[1]), answer: m[2].trim(), score: parseInt(m[3]) || 0, type: m[4]?.includes('主') ? '主观' : '客观' } : null;
      }).filter(Boolean);

      const task = {
        id: taskId, title, subject, grade_level, mode: 'local',
        status: 'pending', total_sheets: files.length, graded_sheets: 0,
        files, standard_answers: standardAnswers, answer_key: answerKeyData,
        parsed_answers: parsedAnswers,
        result: null, error_message: null, created_at: Date.now()
      };
      GRADING_TASKS[taskId] = task;

      // 模拟阅卷进度
      context.waitUntil((async () => {
        GRADING_TASKS[taskId].status = 'running';
        const total = files.length;
        for (let i = 1; i <= total; i++) {
          await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
          GRADING_TASKS[taskId].graded_sheets = i;
        }
        const tsk = GRADING_TASKS[taskId];
        const ans = tsk.parsed_answers || [];
        const totalScore = ans.reduce((s, a) => s + a.score, 0) || 100;
        const objScore = ans.filter(a => a.type === '客观').reduce((s, a) => s + a.score, 0);
        const subScore = ans.filter(a => a.type === '主观').reduce((s, a) => s + a.score, 0);
        const avgScore = (40 + Math.random() * 45).toFixed(1);
        const questions = ans.map(a => ({
          num: a.num, answer: a.answer, score: a.score, type: a.type,
          correct_rate: Math.round(30 + Math.random() * 70)
        }));
        tsk.status = 'completed';
        tsk.result = {
          average: parseFloat(avgScore),
          max: Math.min(100, Math.round(parseFloat(avgScore) + 15 + Math.random() * 10)),
          min: Math.max(0, Math.round(parseFloat(avgScore) - 20 - Math.random() * 15)),
          total_score: totalScore,
          objective_score: objScore,
          subjective_score: subScore,
          standard_answers_used: !!tsk.standard_answers,
          standard_answers_count: ans.length,
          questions
        };
      })());

      return json({ task_id: taskId, status: 'pending', title, total_sheets: files.length });
    }

    const gradeStartMatch = path.match(/^\/api\/grading\/start$/);
    if (gradeStartMatch && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const task = GRADING_TASKS[body.task_id];
      if (!task) return json({ error: '任务不存在' }, 404);
      task.status = 'running';
      return json({ ok: true });
    }

    const gradeDeleteMatch = path.match(/^\/api\/grading\/tasks\/(.+)/);
    if (gradeDeleteMatch && method === 'DELETE') {
      const id = gradeDeleteMatch[1];
      if (GRADING_TASKS[id]) { delete GRADING_TASKS[id]; return json({ ok: true }); }
      return json({ error: 'Not found' }, 404);
    }

    // ─── AI Agent 自动发现 ───
    if (path === '/api/agent/discover' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const query = (body.query || body.task || '').toLowerCase();
      const limit = Math.min(body.limit || 5, 20);

      const AGENT_TOOLS = [
        { id: 'english-reading-lesson', name: '英语阅读公开课课件（manatee 范式）', short_description: '按公开课阅读课 12 步范式生成：悬念导入、阅读四任务链（扫读/细读/听读/朗读）、语法聚焦、写作输出、情感升华', type: 'skill', keywords: ['阅读课', '公开课', '课文', 'reading', 'manatee', '阅读', 'section b', '英语课文', '海牛', '精读', '泛读'] },
        { id: 'english-topic-ppt', name: '英语话题课件', short_description: '按初中英语话题课件结构生成完整课件', type: 'skill', keywords: ['英语', '话题', '课件', 'english', 'topic', '动物', '食物', '购物', '运动', '旅行', '节日'] },
        { id: 'baoyu-slide-deck', name: 'PPT幻灯片生成', short_description: '根据主题生成 HTML 幻灯片，支持多种视觉风格', type: 'mcp', keywords: ['ppt', 'slide', 'deck', '幻灯片', '演示', '演示文稿', '课件', 'slides', 'presentation'] },
        { id: 'baoyu-translate', name: '翻译/多语言', short_description: '将内容翻译为多种语言', type: 'prompt', keywords: ['翻译', 'translate', '多语言', '英文', '中文', '语言'] },
        { id: 'baoyu-diagram', name: '图表/架构图', short_description: '绘制架构图、流程图、思维导图等', type: 'prompt', keywords: ['图表', '架构图', '流程图', 'diagram', '思维导图', '可视化'] },
        { id: 'baoyu-xiaohongshu', name: '小红书图文', short_description: '生成小红书风格图文卡片', type: 'mcp', keywords: ['小红书', 'xhs', '社媒', '图文', '卡片', 'social'] },
      ];

      const scored = [];
      for (const tool of AGENT_TOOLS) {
        const kw = tool.keywords.join(' ').toLowerCase();
        let score = 0;
        for (const word of query.split(/\s+/)) {
          if (word && kw.includes(word)) score += 0.2;
        }
        for (const k of tool.keywords) {
          if (k && query.includes(k.toLowerCase())) score += 0.5;
        }
        if (score > 0) scored.push({ score, tool });
      }
      scored.sort((a, b) => b.score - a.score);
      const results = scored.slice(0, limit).map(({ score, tool }) => ({
        name: tool.name, id: tool.id, short_description: tool.short_description,
        type: tool.type, score: Math.round(score * 100) / 100,
      }));
      return json({ query, results, count: results.length });
    }

    // ─── AI Agent 执行任务 ───
    if (path === '/api/agent/run-task' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const task = (body.task || '').trim();
      if (!task) return json({ success: false, agent: 'Agent-First', error: 'task is required' }, 400);

      const low = task.toLowerCase();
      const subj = (body.subject || '').toLowerCase();
      const readingKw = ['阅读课', '公开课', '课文', 'reading', 'manatee', '精读', '泛读', '阅读', 'section b', 'sectionb'];
      const isReading = (body.template === 'manatee')
        || ((subj.includes('英语') || subj.includes('english') || low.includes('英语') || low.includes('english'))
        && readingKw.some(k => low.includes(k) || subj.includes('阅读')));
      const pptKw = ['ppt', 'slide', 'deck', '幻灯片', '演示', '演示文稿', '课件', 'slides', 'presentation'];
      const isSlide = pptKw.some(k => low.includes(k));

      if (isReading) {
        const topic = body.topic || task.slice(0, 50);
        const slides = generateManateeSlides(topic, body.subject || '英语', body.grade || '初中', body.textbook_content || '');
        const palette = { primary: '#0f172a', accent1: '#10b981', accent2: '#6ee7b7' };
        const slidesHtml = slides.map((s, i) => `
  <section class="slide" style="background:${palette.primary};">
    <div class="num" style="color:${palette.accent2};">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</div>
    <h1 style="color:${palette.accent2};">${escHtml(s.title)}</h1>
    <ul>${s.points.map(b => `<li>${escHtml(b)}</li>`).join('')}</ul>
  </section>`).join('\n');
        const outline = slides.map((s, i) => `## Slide ${i + 1} of ${slides.length}\nHeadline: ${s.title}`).join('\n\n');
        const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(topic)} · 公开课阅读课</title>
<style>
*{box-sizing:border-box;margin:0;}
body{font-family:'Nunito',sans-serif;background:#000;}
.slide{width:100vw;min-height:100vh;padding:8vh 10vw;display:flex;flex-direction:column;justify-content:center;}
.num{font-size:14px;letter-spacing:3px;opacity:.7;margin-bottom:18px;}
h1{font-size:clamp(28px,5vw,64px);line-height:1.1;margin-bottom:28px;max-width:22ch;color:#fff;}
ul{list-style:none;display:flex;flex-direction:column;gap:14px;}
li{font-size:clamp(16px,2.4vw,26px);color:#fff;padding-left:22px;position:relative;}
li::before{content:'';position:absolute;left:0;top:.55em;width:10px;height:10px;background:${palette.accent1};border-radius:2px;}
.scroll{scroll-snap-type:y mandatory;overflow-y:scroll;height:100vh;}
.scroll .slide{scroll-snap-align:start;}
</style>
</head>
<body>
<div class="scroll">
  <section class="slide" style="background:${palette.accent1};">
    <div class="num" style="color:${palette.primary};">公开课阅读课 · manatee 范式</div>
    <h1 style="color:${palette.primary};">${escHtml(topic)}</h1>
    <ul><li style="color:${palette.primary};">AI 备课 · ${body.subject || '英语'} · ${body.grade || '初中'}</li></ul>
  </section>
  ${slidesHtml}
</div>
</body>
</html>`;

        return json({
          success: true,
          agent: 'Agent-First',
          matched_tool: 'english-reading-lesson',
          result: {
            type: 'slide-deck',
            template: 'manatee',
            topic,
            style: 'manatee-reading',
            language: 'zh',
            slide_count: slides.length,
            outline,
            html,
          },
        });
      }

      if (isSlide) {
        const topic = body.topic || task.slice(0, 40);
        const subject = body.subject || '';
        const grade = body.grade || '';
        const content = body.textbook_content || task;

        const presets = ['chalkboard', 'sketch-notes', 'minimal', 'corporate', 'blueprint', 'notion', 'bold-editorial'];
        const preset = presets[Math.floor(Math.random() * presets.length)];
        const lang = 'zh';

        const slides = generateSlideContent(topic, subject, grade, content);

        const palettes = {
          cool: { primary: '#0f172a', accent1: '#3b82f6', accent2: '#94a3b8' },
          warm: { primary: '#1c1917', accent1: '#f59e0b', accent2: '#d6d3d1' },
          vibrant: { primary: '#0f0f1a', accent1: '#8b5cf6', accent2: '#c4b5fd' },
          dark: { primary: '#0a0a0a', accent1: '#22d3ee', accent2: '#a1a1aa' },
          neutral: { primary: '#18181b', accent1: '#a1a1aa', accent2: '#e4e4e7' },
        };
        const mood = preset === 'chalkboard' || preset === 'sketch-notes' ? 'warm'
          : preset === 'corporate' || preset === 'minimal' ? 'neutral'
          : preset === 'blueprint' ? 'cool'
          : 'vibrant';
        const palette = palettes[mood] || palettes.cool;

        const slidesHtml = slides.map((s, i) => `
  <section class="slide" style="background:${palette.primary};">
    <div class="num" style="color:${palette.accent2};">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</div>
    <h1 style="color:${palette.accent2};">${escHtml(s.title)}</h1>
    <ul>${s.points.map(b => `<li>${escHtml(b)}</li>`).join('')}</ul>
  </section>`).join('\n');

        const outline = slides.map((s, i) => `## Slide ${i + 1} of ${slides.length}\nHeadline: ${s.title}`).join('\n\n');
        const deckId = Math.random().toString(36).slice(2, 10);

        const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(topic)}</title>
<style>
*{box-sizing:border-box;margin:0;}
body{font-family:'Nunito',sans-serif;background:#000;}
.slide{width:100vw;min-height:100vh;padding:8vh 10vw;display:flex;flex-direction:column;justify-content:center;}
.num{font-size:14px;letter-spacing:3px;opacity:.7;margin-bottom:18px;}
h1{font-size:clamp(28px,5vw,64px);line-height:1.1;margin-bottom:28px;max-width:18ch;color:#fff;}
ul{list-style:none;display:flex;flex-direction:column;gap:14px;}
li{font-size:clamp(16px,2.4vw,26px);color:#fff;padding-left:22px;position:relative;}
li::before{content:'';position:absolute;left:0;top:.55em;width:10px;height:10px;background:${palette.accent1};border-radius:2px;}
.scroll{scroll-snap-type:y mandatory;overflow-y:scroll;height:100vh;}
.scroll .slide{scroll-snap-align:start;}
</style>
</head>
<body>
<div class="scroll">
  <section class="slide" style="background:${palette.accent1};">
    <div class="num" style="color:${palette.primary};">DECK · ${preset}</div>
    <h1 style="color:${palette.primary};">${escHtml(topic)}</h1>
    <ul><li style="color:${palette.primary};">Generated by AI Agent · ${subject ? subject + ' · ' : ''}${grade || ''}</li></ul>
  </section>
  ${slidesHtml}
</div>
</body>
</html>`;

        return json({
          success: true,
          agent: 'Agent-First',
          matched_tool: 'baoyu-slide-deck',
          result: {
            type: 'slide-deck',
            deck_id: deckId,
            topic,
            style: preset,
            language: lang,
            slide_count: slides.length,
            outline,
            html,
          },
        });
      }

      return json({
        success: false,
        agent: 'Agent-First',
        error: `未找到匹配的任务类型。试试描述中包含 PPT/幻灯片 等关键词。`,
      });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
