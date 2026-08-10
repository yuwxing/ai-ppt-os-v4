import client from './client';

export async function startLessonPlan(data) {
  const apiKey = localStorage.getItem('ppt_master_api_key') || undefined;
  const res = await client.post('/generate/', {
    topic: data.topic,
    subject: data.subject || '',
    grade: data.grade || '',
    book: data.book || '',
    lesson_type: data.lesson_type || '新授课',
    lesson_period: data.lesson_period || '',
    textbook_content: data.textbook_content || '',
    images: data.images || [],
    api_key: apiKey,
    template_style: data.template || data.template_style || undefined,
  });
  return res.data;
}

export async function getLessonStatus(taskId) {
  const res = await client.get(`/generate/status/${taskId}`);
  return res.data;
}

export async function ocrImage(imageBase64, meta = {}) {
  const apiKey = localStorage.getItem('ppt_master_api_key') || undefined;
  const res = await client.post('/generate/ocr', {
    image: imageBase64,
    api_key: apiKey,
    ...meta,
  });
  return res.data;
}

// ─── AI Agent 自动发现 + 调用 ───

export async function agentRunTask(task, topic = '', subject = '', grade = '', textbook_content = '', template = '') {
  const res = await client.post('/agent/run-task', { task, topic, subject, grade, textbook_content, template });
  return res.data;
}

export async function agentDiscover(query, limit = 5) {
  const res = await client.post('/agent/discover', { query, limit });
  return res.data;
}

// AI 生成单页课件内容（编辑器用）
export async function generateSlideWithAI({ topic, subject, grade, pageType, pageLabel, context = '' }) {
  const apiKey = localStorage.getItem('ppt_master_api_key') || undefined;
  const res = await client.post('/generate/slide', {
    topic, subject, grade, page_type: pageType, page_label: pageLabel, context, api_key: apiKey,
  });
  return res.data;
}
