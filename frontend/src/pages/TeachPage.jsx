import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listLessons } from '../api/lessons';
import { Play, Monitor, Smartphone, Users, Clock, Loader2 } from 'lucide-react';

const CLASSROOM_THEMES = [
  { id: 'default', name: '标准课堂', icon: Monitor, desc: '适合大屏投影教学' },
  { id: 'interactive', name: '互动模式', icon: Smartphone, desc: '学生扫码同步互动' },
  { id: 'group', name: '分组教学', icon: Users, desc: '小组协作讨论模式' },
];

export default function TeachPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('default');

  useEffect(() => {
    listLessons().then(setLessons).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">上课</h1>
        <p className="text-gray-400 mt-1">选择课件，开始互动教学</p>
      </div>

      {/* 课堂模式 */}
      <div className="flex flex-col md:flex-row gap-3">
        {CLASSROOM_THEMES.map(({ id, name, icon: Icon, desc }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              mode === id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Icon size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">{name}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 待上课课件 */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">我的课件</h2>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} /></div>
        ) : !Array.isArray(lessons) || lessons.length === 0 ? (
          <div className="card p-12 text-center">
            <Play size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">还没有课件，先去备课吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((l) => (
              <div key={l.id} className="card overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate mb-1">{l.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {l.subject && `${l.subject} · `}{l.grade && `${l.grade}`} · {l.slide_count || 0} 页
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/lessons/play/${l.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
                    >
                      <Play size={16} /> 开始上课
                    </button>
                    <button onClick={() => navigate(`/lessons/edit/${l.id}`)}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition text-xs"
                    >编辑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 最近课堂记录 */}
      <div className="card p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">最近上课记录</h2>
        <div className="text-center py-8 text-gray-400">
          <Clock size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm">暂无上课记录</p>
          <p className="text-xs text-gray-300 mt-1">开始上课后，记录将自动保存</p>
        </div>
      </div>
    </div>
  );
}
