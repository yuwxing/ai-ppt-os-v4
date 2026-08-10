import React from 'react';
import { BarChart3, TrendingUp, Users, Presentation, ArrowUp, Clock, Target } from 'lucide-react';

const STATS = [
  { icon: <Presentation size={24} />, value: '3,120', label: 'PPT生成总数', change: '+12.5%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: <Users size={24} />, value: '86', label: '活跃教师', change: '+8.3%', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: <TrendingUp size={24} />, value: '82%', label: '平台使用率', change: '+5.1%', color: 'text-pink-600', bg: 'bg-pink-50' },
  { icon: <Clock size={24} />, value: '65%', label: '平均节省时间', change: '+3.2%', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const RECENT = [
  { topic: '光合作用', pages: 12, teacher: '张老师', time: '2分钟前', status: '已完成' },
  { topic: 'Python入门', pages: 18, teacher: '李老师', time: '15分钟前', status: '已完成' },
  { topic: '二次函数', pages: 10, teacher: '王老师', time: '32分钟前', status: '已完成' },
  { topic: '英语时态', pages: 14, teacher: '赵老师', time: '1小时前', status: '已完成' },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">数据概览</h2>
        <p className="text-gray-500 mt-1">教学数据可视化分析</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-0.5"><ArrowUp size={14} />{s.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Target size={18} className="text-indigo-600" /> 使用趋势</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-500" style={{ height: `${h}%` }} />
                <span className="text-xs text-gray-400">周{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-indigo-600" /> 最近生成</h3>
          <div className="space-y-3">
            {RECENT.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-800">{r.topic}</div>
                  <div className="text-xs text-gray-400">{r.teacher} · {r.pages}页</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">{r.status}</div>
                  <div className="text-xs text-gray-400">{r.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
