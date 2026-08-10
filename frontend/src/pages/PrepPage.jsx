import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listLessons } from '../api/lessons';
import { BookOpen, Plus, Sparkles, Clock, FileText, ChevronRight, Loader2 } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'AI 生成课件', desc: '输入主题，AI 自动生成完整课件', color: 'from-indigo-500 to-purple-600', path: '/prep/generate' },
  { icon: FileText, label: '从模板创建', desc: '从模板库选择课件模板', color: 'from-emerald-500 to-teal-600', path: '/prep/templates' },
  { icon: Plus, label: '空白创建', desc: '从零开始创建新课件', color: 'from-orange-500 to-pink-500', path: '/lessons/new' },
];

export default function PrepPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLessons().then(setLessons).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">备课</h1>
        <p className="text-gray-400 mt-1">AI 辅助备课，快速生成高质量课件</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className="card p-5 text-left hover:shadow-lg transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
          </button>
        ))}
      </div>

      {/* Recent Lessons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">我的课件</h2>
          <button onClick={() => navigate('/lessons')} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            查看全部 <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} /></div>
        ) : !Array.isArray(lessons) || lessons.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">还没有课件，点击上方按钮开始备课</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((l) => (
              <div key={l.id}
                onClick={() => navigate(`/lessons/edit/${l.id}`)}
                className="card p-4 cursor-pointer hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">{l.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    l.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>{l.status === 'published' ? '已发布' : '草稿'}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  {l.subject && `${l.subject} · `}{l.grade && `${l.grade}`}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FileText size={12} />{l.slide_count || 0} 页</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{l.updated_at ? new Date(l.updated_at).toLocaleDateString('zh-CN') : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
