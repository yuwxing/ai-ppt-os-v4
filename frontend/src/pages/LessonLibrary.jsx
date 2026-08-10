import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listLessons, deleteLesson } from '../api/lessons';
import { Plus, FileText, Edit2, Trash2, Eye, Clock, BookOpen, Loader2 } from 'lucide-react';

export default function LessonLibrary() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      setLoading(true);
      const data = await listLessons();
      setLessons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load lessons:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`确定删除课件「${title}」？`)) return;
    try {
      await deleteLesson(id);
      loadLessons();
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  }

  const statusBadge = (status) => {
    const map = { draft: ['草稿', 'bg-gray-100 text-gray-600'], published: ['已发布', 'bg-green-100 text-green-600'] };
    const [label, cls] = map[status] || ['未知', 'bg-gray-100 text-gray-600'];
    return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="animate-spin inline-block text-indigo-600" size={40} />
        <p className="text-gray-500 mt-4">加载课件中...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={28} />
            我的课件库
          </h2>
          <p className="text-gray-500 mt-1">管理所有 AI 课件，支持编辑、播放、分享</p>
        </div>
        <Link to="/lessons/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          新建课件
        </Link>
      </div>

      {/* 课件列表 */}
      {!Array.isArray(lessons) || lessons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">还没有课件</h3>
          <p className="text-gray-500 mb-6">点击「新建课件」用AI创建第一个交互式课件吧</p>
          <Link to="/lessons/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            创建第一个课件
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
              {/* 顶栏 */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{lesson.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {lesson.subject && `${lesson.subject} · `}
                      {lesson.grade && `${lesson.grade} · `}
                      {lesson.textbook || '通用'}
                    </p>
                  </div>
                  {statusBadge(lesson.status)}
                </div>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {lesson.slide_count || 0} 页
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString('zh-CN') : '-'}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/lessons/play/${lesson.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                  >
                    <Eye size={16} /> 播放
                  </button>
                  <button onClick={() => navigate(`/lessons/edit/${lesson.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                  >
                    <Edit2 size={16} /> 编辑
                  </button>
                  <button onClick={() => handleDelete(lesson.id, lesson.title)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
