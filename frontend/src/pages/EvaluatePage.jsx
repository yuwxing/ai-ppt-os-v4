import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Target, ChevronDown, Download, Calendar } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: 1, name: '李明', attendance: 95, homework: 88, test: 92, avg: 91.7, trend: 'up' },
  { id: 2, name: '张华', attendance: 100, homework: 95, test: 88, avg: 94.3, trend: 'up' },
  { id: 3, name: '王芳', attendance: 90, homework: 82, test: 85, avg: 85.7, trend: 'stable' },
  { id: 4, name: '赵强', attendance: 80, homework: 75, test: 78, avg: 77.7, trend: 'down' },
  { id: 5, name: '刘洋', attendance: 85, homework: 90, test: 95, avg: 90, trend: 'up' },
];

const MOCK_CLASSES = [
  { name: '七年级(1)班', avgScore: 86.4, ranking: 2, total: 6, students: 42 },
  { name: '七年级(2)班', avgScore: 82.1, ranking: 4, total: 6, students: 40 },
];

export default function EvaluatePage() {
  const [view, setView] = useState('overview');

  const trendIcon = (t) => {
    if (t === 'up') return <TrendingUp size={14} className="text-green-500" />;
    if (t === 'down') return <TrendingUp size={14} className="text-red-500 rotate-180" />;
    return <span className="w-3 h-0.5 bg-gray-300 inline-block rounded" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">评价</h1>
        <p className="text-gray-400 mt-1">学情分析、成绩统计、综合评价</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: '学生总数', value: '124', change: '+5', color: 'indigo' },
          { icon: BookOpen, label: '平均出勤率', value: '92%', change: '+2%', color: 'emerald' },
          { icon: Target, label: '平均分', value: '85.6', change: '+3.2', color: 'amber' },
          { icon: Award, label: '优秀率', value: '42%', change: '+5%', color: 'rose' },
        ].map(({ icon: Icon, label, value, change, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                <Icon size={18} className={`text-${color}-600`} />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {[
          { id: 'overview', label: '总览', icon: BarChart3 },
          { id: 'class', label: '班级对比', icon: Users },
          { id: 'student', label: '学生明细', icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 成绩分布 */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">成绩分布</h2>
            <div className="space-y-3">
              {[
                { range: '90-100', count: 28, pct: 35, color: 'bg-green-500' },
                { range: '80-89', count: 32, pct: 40, color: 'bg-blue-500' },
                { range: '70-79', count: 12, pct: 15, color: 'bg-amber-500' },
                { range: '60-69', count: 6, pct: 7.5, color: 'bg-orange-500' },
                { range: '<60', count: 2, pct: 2.5, color: 'bg-red-500' },
              ].map((r) => (
                <div key={r.range} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12">{r.range}分</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{r.count}人</span>
                </div>
              ))}
            </div>
          </div>

          {/* 评价维度 */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">综合评价维度</h2>
            <div className="space-y-4">
              {[
                { dim: '知识掌握', score: 86, color: 'bg-indigo-500' },
                { dim: '作业完成', score: 82, color: 'bg-emerald-500' },
                { dim: '课堂参与', score: 78, color: 'bg-amber-500' },
                { dim: '学习态度', score: 90, color: 'bg-rose-500' },
              ].map((d) => (
                <div key={d.dim}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{d.dim}</span>
                    <span className="font-semibold text-gray-800">{d.score}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'class' && (
        <div className="space-y-3">
          {MOCK_CLASSES.map((c) => (
            <div key={c.name} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-xs text-gray-400">{c.students} 名学生</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">{c.avgScore}</p>
                  <p className="text-xs text-gray-400">平均分</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">排名：</span>
                <span className="font-medium text-indigo-600">第 {c.ranking} 名</span>
                <span className="text-gray-300">/ 共 {c.total} 班</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'student' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">学生成绩明细</h2>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <Download size={14} /> 导出
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="text-left p-4 font-medium">姓名</th>
                  <th className="text-center p-4 font-medium">出勤率</th>
                  <th className="text-center p-4 font-medium">作业</th>
                  <th className="text-center p-4 font-medium">测验</th>
                  <th className="text-center p-4 font-medium">平均分</th>
                  <th className="text-center p-4 font-medium">趋势</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_STUDENTS.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {s.name[0]}
                        </div>
                        <span className="font-medium text-gray-700">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-4">{s.attendance}%</td>
                    <td className="text-center p-4">{s.homework}</td>
                    <td className="text-center p-4">{s.test}</td>
                    <td className="text-center p-4 font-semibold text-gray-800">{s.avg}</td>
                    <td className="text-center p-4 flex justify-center">{trendIcon(s.trend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
