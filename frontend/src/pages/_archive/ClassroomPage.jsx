import React from 'react';
import { GraduationCap, Video, Mic, Play, Bot, Headphones } from 'lucide-react';

const COURSES = [
  { title: '光合作用', teacher: 'AI张老师', duration: '12:30', students: 45, status: '可观看' },
  { title: 'Python基础', teacher: 'AI李老师', duration: '18:20', students: 38, status: '可观看' },
  { title: '二次函数', teacher: 'AI王老师', duration: '15:00', students: 52, status: '可观看' },
  { title: '英语时态', teacher: 'AI赵老师', duration: '20:10', students: 29, status: '可观看' },
];

export default function ClassroomPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">AI课堂</h2>
        <p className="text-gray-500 mt-1">AI虚拟教师自动讲解，支持配音和自定义形象</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Bot size={24} />, title: 'AI虚拟教师', desc: '自动讲解PPT内容' },
          { icon: <Mic size={24} />, title: '语音合成', desc: '多种声音可选' },
          { icon: <Headphones size={24} />, title: '智能问答', desc: '学生可语音提问' },
        ].map((f, i) => (
          <div key={i} className="feature-card flex items-center gap-4">
            <div className="text-indigo-600">{f.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-800">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {COURSES.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
            <div className="h-32 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition">
                <Play size={24} className="text-white ml-1" />
              </div>
              <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded">{c.duration}</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Bot size={14} /> {c.teacher}</p>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">{c.status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Video size={14} /> {c.students} 人学习</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
