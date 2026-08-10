import client from './client';

export async function listLessons() {
  const res = await client.get('/lessons');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getLesson(id) {
  const res = await client.get(`/lessons/${id}`);
  return res.data;
}

export async function createLesson(data) {
  const res = await client.post('/lessons', data);
  return res.data;
}

export async function updateLesson(id, data) {
  const res = await client.put(`/lessons/${id}`, data);
  return res.data;
}

export async function deleteLesson(id) {
  const res = await client.delete(`/lessons/${id}`);
  return res.data;
}

export async function getDefaultTemplate() {
  const res = await client.get('/lessons/template/default');
  return res.data;
}

// 本地：从模板 JSON 导入课件
export function importLessonFromJson(jsonData) {
  return {
    title: jsonData.meta?.title || jsonData.title || '未命名课件',
    subject: jsonData.meta?.subject || '',
    grade: jsonData.meta?.grade || '',
    textbook: jsonData.meta?.textbook || '',
    unit: jsonData.meta?.unit || '',
    template_style: jsonData.design?.theme_name || 'story-magic',
    slides: jsonData.slides || [],
  };
}
