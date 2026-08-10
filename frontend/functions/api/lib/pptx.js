import PptxGenJS from 'pptxgenjs';

// ─── 教学课件设计系统 ───
// 基于 pptxgenjs 构建，输出真正可用于教学过程的 PPT。
// 版式：封面 / 学习目标 / 课堂流程 / 知识内容 / 课堂活动 / 分层作业 / 主题升华

const THEMES = {
  'story-magic': {
    name: '故事魔法',
    primary: 'F4A261', secondary: '2A9D8F', accent: 'E76F51',
    bg: 'FFF3E0', text: '264653', light: 'FFFDF7', card: 'FFFFFF',
  },
  'classic-education': {
    name: '经典教学',
    primary: '2B5C8F', secondary: '5B9BD5', accent: 'E8751A',
    bg: 'FFFFFF', text: '333333', light: 'EAF2FA', card: 'F7FBFE',
  },
  'science-lab': {
    name: '科学实验室',
    primary: '1A237E', secondary: '00BCD4', accent: '76FF03',
    bg: 'F5F5F5', text: '212121', light: 'E8EAF6', card: 'FAFAFA',
  },
  'premium-business': {
    name: '商务精英',
    primary: '1B1F3B', secondary: '4A4E69', accent: 'C9A84C',
    bg: 'FAFAFA', text: '1A1A1A', light: 'EEF0F6', card: 'FFFFFF',
  },
  'storybook-amber': {
    name: '琥珀故事',
    primary: '4F81BD', secondary: 'C0504D', accent: '9BBB59',
    bg: 'FFF8F0', text: '333333', light: 'E8F0FA', card: 'FFFFFF',
  },
  'ocean-teal': {
    name: '深海蓝绿',
    primary: '4BACC6', secondary: 'F79646', accent: '8064A2',
    bg: 'F0F8FA', text: '264653', light: 'E0F2F6', card: 'FFFFFF',
  },
  'forest-green': {
    name: '森林自然',
    primary: '548235', secondary: 'BF8F00', accent: 'ED7D31',
    bg: 'F5F9F0', text: '333333', light: 'E8F2E0', card: 'FFFFFF',
  },
  'sunset-warm': {
    name: '暖阳落日',
    primary: 'C0504D', secondary: 'F79646', accent: '9BBB59',
    bg: 'FFF8F0', text: '4A3728', light: 'FBE9E9', card: 'FFFFFF',
  },
  'calm-lavender': {
    name: '静谧紫韵',
    primary: '8064A2', secondary: '4BACC6', accent: 'F79646',
    bg: 'F8F5FF', text: '333333', light: 'EDE7F6', card: 'FFFFFF',
  },
};

const DEFAULT_THEME = THEMES['story-magic'];
const W = 13.333, H = 7.5;
const M = 0.55;          // 页边距
const CONTENT_W = W - M * 2;

function hex(c) { return c.replace('#', ''); }
function getTheme(style) { return THEMES[style] || DEFAULT_THEME; }

// 安全读取字段
const f = (o, k, d) => (o && o[k] != null) ? o[k] : d;

// ─── 顶部标题条 ───
function addHeader(pptx, slide, theme, title, subtitle) {
  // 左侧强调块
  slide.addShape('rect', { x: M, y: 0.42, w: 0.12, h: 0.62, fill: { color: theme.primary } });
  slide.addText(title, {
    x: M + 0.25, y: 0.32, w: CONTENT_W - 0.25, h: 0.7,
    fontSize: 26, bold: true, color: theme.primary, fontFace: '微软雅黑', align: 'left', valign: 'middle',
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: M, y: 0.95, w: CONTENT_W, h: 0.32,
      fontSize: 11, color: '8A8A8A', fontFace: '微软雅黑', align: 'left',
    });
  }
  // 顶部装饰线
  slide.addShape('rect', { x: 0, y: 0, w: W, h: 0.05, fill: { color: theme.accent } });
  // 页码
  slide.addText('', { x: 0, y: 0, w: 0.1, h: 0.1, text: '' });
}

// ─── 底部页脚 ───
function addFooter(pptx, slide, theme, pageNum, total, topic) {
  slide.addShape('rect', { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: theme.primary } });
  slide.addText(`${topic}  ·  ${pageNum} / ${total}`, {
    x: M, y: H - 0.32, w: CONTENT_W, h: 0.32,
    fontSize: 9, color: 'FFFFFF', fontFace: '微软雅黑', align: 'right', valign: 'middle',
  });
}

// ─── 封面页 ───
function addCover(pptx, theme, meta, topic) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.primary };
  // 装饰圆
  slide.addShape('ellipse', { x: W - 2.6, y: -1.2, w: 4.2, h: 4.2, fill: { color: theme.secondary, transparency: 55 }, line: { color: theme.primary, transparency: 100 } });
  slide.addShape('ellipse', { x: -1.4, y: H - 3.0, w: 3.6, h: 3.6, fill: { color: theme.accent, transparency: 60 }, line: { color: theme.primary, transparency: 100 } });
  slide.addShape('rect', { x: 0, y: H - 0.14, w: W, h: 0.14, fill: { color: theme.accent } });

  const subject = f(meta, 'subject', '');
  const grade = f(meta, 'grade', '');
  const book = f(meta, 'book', '');
  const lessonType = f(meta, 'lesson_type', '');
  const lessonPeriod = f(meta, 'lesson_period', '');

  slide.addText('AI PPT OS', {
    x: M, y: 0.7, w: 4, h: 0.5,
    fontSize: 13, color: 'FFFFFF', fontFace: '微软雅黑', charSpacing: 6, align: 'left',
  });
  slide.addText(topic || '课件标题', {
    x: M, y: 2.2, w: CONTENT_W, h: 1.7,
    fontSize: 44, bold: true, color: 'FFFFFF', fontFace: '微软雅黑', align: 'left', valign: 'middle',
  });
  const subParts = [subject, grade, book].filter(Boolean);
  slide.addText(subParts.join('  |  ') || '教学课件', {
    x: M, y: 4.0, w: CONTENT_W, h: 0.6,
    fontSize: 20, color: 'FFFFFF', transparency: 10, fontFace: '微软雅黑', align: 'left',
  });
  const typeParts = [lessonType, lessonPeriod].filter(Boolean);
  slide.addText(typeParts.join(' · ') || '', {
    x: M, y: 4.65, w: CONTENT_W, h: 0.5,
    fontSize: 14, color: 'FFFFFF', transparency: 20, fontFace: '微软雅黑', align: 'left',
  });
  slide.addText('● 教学目标明确  ● 环节设计完整  ● 课堂互动丰富', {
    x: M, y: 6.3, w: CONTENT_W, h: 0.4,
    fontSize: 11, color: 'FFFFFF', transparency: 30, fontFace: '微软雅黑', charSpacing: 1, align: 'left',
  });
  return slide;
}

// ─── 学习目标页 ───
function addObjectives(pptx, theme, result) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };
  addHeader(pptx, slide, theme, '学习目标', '本课学习完成后，学生将能够……');

  const objs = f(result, 'objectives', null);
  const goals = objs && objs.length ? objs
    : [
        '掌握本课的核心知识与关键概念',
        '能够运用所学知识解决实际问题',
        '通过课堂活动提升合作与表达能力',
        '培养学科核心素养与学习兴趣',
      ];
  const colors = [theme.primary, theme.secondary, theme.accent, theme.text];
  let y = 1.6;
  goals.slice(0, 4).forEach((g, i) => {
    slide.addShape('roundRect', { x: M, y, w: CONTENT_W, h: 1.0, rectRadius: 0.12, fill: { color: theme.card }, line: { color: colors[i % 4], width: 1 } });
    slide.addShape('ellipse', { x: M + 0.25, y: y + 0.3, w: 0.4, h: 0.4, fill: { color: colors[i % 4] } });
    slide.addText(String(i + 1), {
      x: M + 0.25, y: y + 0.3, w: 0.4, h: 0.4,
      fontSize: 16, bold: true, color: 'FFFFFF', fontFace: '微软雅黑', align: 'center', valign: 'middle',
    });
    slide.addText(g, {
      x: M + 0.9, y, w: CONTENT_W - 1.15, h: 1.0,
      fontSize: 16, color: theme.text, fontFace: '微软雅黑', align: 'left', valign: 'middle',
    });
    y += 1.22;
  });

  addFooter(pptx, slide, theme, 2, pptx._slideCount, f(result, 'topic', '课件'));
  return slide;
}

// ─── 课堂流程页 ───
function addFlow(pptx, theme, result) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };
  addHeader(pptx, slide, theme, '课堂流程', '一节课的完整教学环节设计');

  const flow = f(result, 'class_flow', null) || [
    { time: '5分钟', phase: '情境导入', desc: '激发兴趣，引入课题', icon: '导入' },
    { time: '10分钟', phase: '自主探究', desc: '学生主动探索新知', icon: '探究' },
    { time: '15分钟', phase: '合作学习', desc: '小组协作，深化理解', icon: '合作' },
    { time: '10分钟', phase: '练习巩固', desc: '课堂练习，即时反馈', icon: '练习' },
    { time: '5分钟', phase: '总结提升', desc: '梳理知识，升华主题', icon: '总结' },
  ];

  const colors = [theme.primary, theme.secondary, theme.accent, '7A6BB8', '4A9D6E'];
  const n = flow.length;
  const stepW = (CONTENT_W - (n - 1) * 0.25) / n;
  flow.slice(0, 5).forEach((s, i) => {
    const x = M + i * (stepW + 0.25);
    slide.addShape('roundRect', { x, y: 1.6, w: stepW, h: 4.3, rectRadius: 0.1, fill: { color: theme.card }, line: { color: colors[i % 5], width: 1.2 } });
    slide.addShape('ellipse', { x: x + stepW / 2 - 0.55, y: 2.0, w: 1.1, h: 1.1, fill: { color: colors[i % 5] } });
    slide.addText(String(i + 1), {
      x: x + stepW / 2 - 0.55, y: 2.0, w: 1.1, h: 1.1,
      fontSize: 26, bold: true, color: 'FFFFFF', fontFace: '微软雅黑', align: 'center', valign: 'middle',
    });
    slide.addText(f(s, 'phase', ''), {
      x: x, y: 3.3, w: stepW, h: 0.6,
      fontSize: 16, bold: true, color: theme.text, fontFace: '微软雅黑', align: 'center', valign: 'middle',
    });
    slide.addText(f(s, 'time', ''), {
      x: x, y: 3.9, w: stepW, h: 0.4,
      fontSize: 11, color: colors[i % 5], fontFace: '微软雅黑', align: 'center',
    });
    slide.addText(f(s, 'desc', ''), {
      x: x + 0.15, y: 4.4, w: stepW - 0.3, h: 1.4,
      fontSize: 10.5, color: '8A8A8A', fontFace: '微软雅黑', align: 'center', valign: 'top', breakLine: false,
    });
  });
  // 底部进度条
  slide.addShape('roundRect', { x: M, y: 6.25, w: CONTENT_W, h: 0.14, rectRadius: 0.07, fill: { color: 'E0E0E0' } });
  slide.addShape('roundRect', { x: M, y: 6.25, w: CONTENT_W, h: 0.14, rectRadius: 0.07, fill: { color: theme.primary } });

  addFooter(pptx, slide, theme, 3, pptx._slideCount, f(result, 'topic', '课件'));
  return slide;
}

// ─── 知识点内容页（卡片式） ───
function addContentSlide(pptx, theme, item, pageNum, total, topic) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };
  addHeader(pptx, slide, theme, f(item, 'title', '知识点'), f(item, 'goal', ''));

  const content = f(item, 'content', []);
  const bullets = (Array.isArray(content) ? content : [content]).filter(Boolean);
  const narrative = f(item, 'narrative', '');

  // 主体内容区
  const y0 = 1.55;
  const boxH = 4.0;
  slide.addShape('roundRect', { x: M, y: y0, w: CONTENT_W, h: boxH, rectRadius: 0.08, fill: { color: theme.card }, line: { color: 'E3E3E3', width: 1 } });
  slide.addShape('rect', { x: M, y: y0, w: 0.1, h: boxH, fill: { color: theme.primary } });

  const lines = [];
  bullets.forEach((b, i) => {
    lines.push({ text: b, options: { fontSize: i === 0 && bullets.length > 4 ? 15 : 14, color: theme.text, breakLine: true, paraSpaceAfter: 8 } });
  });

  slide.addText(lines, {
    x: M + 0.4, y: y0 + 0.35, w: CONTENT_W - 0.8, h: boxH - 0.7,
    fontSize: 14, color: theme.text, fontFace: '微软雅黑', valign: 'top',
    bullet: { code: '25CF', indent: 12 },
  });

  // 讲解提示条
  if (narrative) {
    slide.addShape('roundRect', { x: M, y: 5.75, w: CONTENT_W, h: 0.75, rectRadius: 0.08, fill: { color: theme.light } });
    slide.addText('💡 教师讲解', {
      x: M + 0.25, y: 5.75, w: 1.5, h: 0.75,
      fontSize: 11, bold: true, color: theme.primary, fontFace: '微软雅黑', align: 'left', valign: 'middle',
    });
    slide.addText(narrative, {
      x: M + 1.75, y: 5.75, w: CONTENT_W - 2.0, h: 0.75,
      fontSize: 10.5, color: theme.text, fontFace: '微软雅黑', align: 'left', valign: 'middle',
    });
  }

  addFooter(pptx, slide, theme, pageNum, total, topic);
  return slide;
}

// ─── 课堂游戏/活动页 ───
function addActivities(pptx, theme, games, pageNum, total, topic) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };
  addHeader(pptx, slide, theme, '课堂互动活动', '通过活动巩固所学，调动课堂氛围');

  const cols = 2;
  const gap = 0.3;
  const cardW = (CONTENT_W - gap) / 2;
  const cardH = 4.4;
  const y0 = 1.5;

  (games || []).slice(0, 4).forEach((g, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    const x = M + col * (cardW + gap);
    const y = y0 + row * (cardH + gap * 1.2);
    slide.addShape('roundRect', { x, y, w: cardW, h: cardH, rectRadius: 0.1, fill: { color: theme.card }, line: { color: theme.secondary, width: 1.2 } });
    slide.addShape('rect', { x: x + 0.35, y: y + 0.3, w: 0.55, h: 0.16, fill: { color: theme.accent } });
    slide.addText(f(g, 'name', ''), {
      x: x + 0.3, y: y + 0.55, w: cardW - 0.6, h: 0.6,
      fontSize: 16, bold: true, color: theme.primary, fontFace: '微软雅黑', align: 'left', valign: 'middle',
    });
    slide.addText([f(g, 'type', ''), f(g, 'phase', ''), f(g, 'duration', '')].filter(Boolean).join(' · '), {
      x: x + 0.3, y: y + 1.2, w: cardW - 0.6, h: 0.35,
      fontSize: 11, color: theme.secondary, fontFace: '微软雅黑', align: 'left',
    });
    slide.addText(f(g, 'description', ''), {
      x: x + 0.3, y: y + 1.65, w: cardW - 0.6, h: 2.4,
      fontSize: 11.5, color: theme.text, fontFace: '微软雅黑', align: 'left', valign: 'top',
    });
    if (f(g, 'learning_goal', '')) {
      slide.addText('目标：' + f(g, 'learning_goal', ''), {
        x: x + 0.3, y: y + cardH - 0.7, w: cardW - 0.6, h: 0.55,
        fontSize: 10, color: '888888', fontFace: '微软雅黑', align: 'left', valign: 'middle', italic: true,
      });
    }
  });

  addFooter(pptx, slide, theme, pageNum, total, topic);
  return slide;
}

// ─── 分层作业页 ───
function addHomework(pptx, theme, homework, pageNum, total, topic) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };
  addHeader(pptx, slide, theme, '分层作业', '基础 · 拓展 · 实践，满足不同层次学生');

  const tiers = [
    { key: '基础', color: theme.primary, icon: '✔' },
    { key: '拓展', color: theme.secondary, icon: '★' },
    { key: '实践', color: theme.accent, icon: '➤' },
  ];
  const colW = (CONTENT_W - 0.6) / 3;

  tiers.forEach((t, i) => {
    const x = M + i * (colW + 0.3);
    const items = (homework || []).filter(h => f(h, 'tier', '') === t.key);
    slide.addShape('roundRect', { x, y: 1.55, w: colW, h: 4.8, rectRadius: 0.1, fill: { color: theme.card }, line: { color: t.color, width: 1.2 } });
    slide.addShape('rect', { x, y: 1.55, w: colW, h: 0.7, fill: { color: t.color }, rectRadius: 0 } );
    slide.addText(`${t.icon} ${t.key}作业`, {
      x, y: 1.55, w: colW, h: 0.7,
      fontSize: 15, bold: true, color: 'FFFFFF', fontFace: '微软雅黑', align: 'center', valign: 'middle',
    });
    let y = 2.5;
    if (!items.length) {
      slide.addText('（暂无该层作业）', {
        x: x + 0.25, y, w: colW - 0.5, h: 0.6,
        fontSize: 12, color: 'AAAAAA', fontFace: '微软雅黑', align: 'center',
      });
    }
    items.forEach((h, j) => {
      slide.addText(f(h, 'title', ''), {
        x: x + 0.25, y, w: colW - 0.5, h: 0.9,
        fontSize: 12.5, bold: true, color: theme.text, fontFace: '微软雅黑', align: 'left', valign: 'middle',
      });
      y += 0.92;
      slide.addText([f(h, 'estimated_time', ''), f(h, 'difficulty', '')].filter(Boolean).join('  ·  '), {
        x: x + 0.25, y, w: colW - 0.5, h: 0.4,
        fontSize: 10.5, color: t.color, fontFace: '微软雅黑', align: 'left', valign: 'middle',
      });
      y += 0.55;
    });
  });

  addFooter(pptx, slide, theme, pageNum, total, topic);
  return slide;
}

// ─── 主题升华页（结课） ───
function addClosing(pptx, theme, te, topic, total) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.primary };
  slide.addShape('ellipse', { x: W - 2.4, y: -1.1, w: 3.8, h: 3.8, fill: { color: theme.secondary, transparency: 55 }, line: { color: theme.primary, transparency: 100 } });
  slide.addShape('ellipse', { x: -1.3, y: H - 2.8, w: 3.4, h: 3.4, fill: { color: theme.accent, transparency: 60 }, line: { color: theme.primary, transparency: 100 } });

  slide.addText('主题升华', {
    x: M, y: 1.2, w: CONTENT_W, h: 0.7,
    fontSize: 15, color: 'FFFFFF', transparency: 35, fontFace: '微软雅黑', charSpacing: 4, align: 'left',
  });
  slide.addText(f(te, 'core_value', '') || topic, {
    x: M, y: 2.2, w: CONTENT_W, h: 1.4,
    fontSize: 34, bold: true, color: 'FFFFFF', fontFace: '微软雅黑', align: 'left', valign: 'middle',
  });
  slide.addText([f(te, 'format', ''), f(te, 'duration', '')].filter(Boolean).join(' · ') || '', {
    x: M, y: 3.8, w: CONTENT_W, h: 0.5,
    fontSize: 13, color: 'FFFFFF', transparency: 20, fontFace: '微软雅黑', align: 'left',
  });
  slide.addText(f(te, 'content', ''), {
    x: M, y: 4.5, w: CONTENT_W - 1.5, h: 2.0,
    fontSize: 15, color: 'FFFFFF', transparency: 10, fontFace: '微软雅黑', align: 'left', valign: 'top',
  });
  slide.addText(`第 ${total} 页  ·  谢谢聆听  ·  欢迎指正`, {
    x: M, y: 6.7, w: CONTENT_W, h: 0.4,
    fontSize: 11, color: 'FFFFFF', transparency: 40, fontFace: '微软雅黑', align: 'left',
  });
  return slide;
}

// ─── 主函数 ───
export async function generatePptx(result, topic, style) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';       // 16:9
  pptx.author = 'AI PPT OS';
  pptx.company = 'AI 备课中心';
  pptx.subject = '教学课件';
  pptx.title = topic || '教学课件';
  pptx.lang = 'zh-CN';

  const theme = getTheme(style || f(result, 'template_style', null));
  const meta = f(result, 'meta', {});
  const topicName = topic || f(meta, 'topic', '') || '教学课件';

  // 1. 封面
  addCover(pptx, theme, meta, topicName);

  // 2. 学习目标
  addObjectives(pptx, theme, result);

  // 3. 课堂流程
  addFlow(pptx, theme, result);

  // 4. 知识点内容页
  const contentSlides = [];
  if (Array.isArray(result.slides) && result.slides.length) {
    const skipTypes = ['cover', 'warmup', 'game', 'summary', 'homework', 'vocabulary'];
    const contentItems = result.slides.filter(s => !skipTypes.includes(f(s, 'component', '')));
    contentSlides.push(...contentItems.map(s => ({ type: 'content', item: s })));
    const vocabItems = result.slides.filter(s => f(s, 'component', '') === 'vocabulary');
    vocabItems.forEach(s => contentSlides.push({ type: 'content', item: s }));
  }
  // 若无 slides 数组，退回用 teacher_guide 生成
  if (!contentSlides.length && Array.isArray(result.teacher_guide)) {
    result.teacher_guide.slice(0, 6).forEach((g, i) => {
      contentSlides.push({
        type: 'content',
        item: {
          title: `教学环节 ${i + 1}`,
          goal: f(g, 'time_allocation', ''),
          content: [f(g, 'teacher_script', ''), f(g, 'student_activity', '').replace(/^学生活动：/, '')].filter(Boolean),
          narrative: (g.questions || []).map(q => f(q, 'question', '')).filter(Boolean).join('；'),
        },
      });
    });
  }

  // 页码从封面(1)开始，目标(2)、流程(3)之后
  let pageNum = 4;
  const totalBase = 3 + contentSlides.length + ((result.games && result.games.length) ? 1 : 0) + ((result.homework && result.homework.length) ? 1 : 0) + 1;
  contentSlides.slice(0, 8).forEach(({ item }) => {
    addContentSlide(pptx, theme, item, pageNum++, totalBase, topicName);
  });

  // 5. 课堂互动活动
  if (result.games && result.games.length) {
    addActivities(pptx, theme, result.games, pageNum++, totalBase, topicName);
  }

  // 6. 分层作业
  if (result.homework && result.homework.length) {
    addHomework(pptx, theme, result.homework, pageNum++, totalBase, topicName);
  }

  // 7. 主题升华（结课）
  addClosing(pptx, theme, f(result, 'theme_elevation', {}), topicName, totalBase);

  const buf = await pptx.write('arraybuffer');
  return buf;
}
