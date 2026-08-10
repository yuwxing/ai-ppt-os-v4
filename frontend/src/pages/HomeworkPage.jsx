import React, { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, FileText, User, Send, Edit3, BookOpen } from 'lucide-react';

const MOCK_HOMEWORKS = [
  { id: 1, title: 'Unit 8 单词默写', class: '七年级(1)班', due: '2026-07-03', submitted: 32, total: 42, status: '进行中' },
  { id: 2, title: '过去时态练习卷', class: '七年级(1)班', due: '2026-07-05', submitted: 28, total: 42, status: '进行中' },
  { id: 3, title: '作文：My Weekend', class: '七年级(2)班', due: '2026-06-30', submitted: 38, total: 40, status: '批改中' },
];

const MOCK_SUBMISSIONS = [
  { id: 1, name: '李明', status: '已提交', score: null, time: '2026-07-01 14:30' },
  { id: 2, name: '张华', status: '已批改', score: 92, time: '2026-07-01 15:00' },
  { id: 3, name: '王芳', status: '已批改', score: 88, time: '2026-07-01 16:20' },
  { id: 4, name: '赵强', status: '未提交', score: null, time: null },
];

export default function HomeworkPage() {
  const [tab, setTab] = useState('assign');
  const [selectedHw, setSelectedHw] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">作业</h1>
        <p className="text-gray-400 mt-1">布置作业、查看提交、在线批改</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-full sm:w-fit overflow-x-auto">
        {[
          { id: 'assign', label: '布置作业', icon: Plus },
          { id: 'review', label: '批改作业', icon: Edit3 },
          { id: 'history', label: '作业记录', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'assign' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 新建作业 */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" /> 布置新作业
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">作业标题</label>
                <input placeholder="输入作业标题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">班级</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300">
                    <option>七年级(1)班</option>
                    <option>七年级(2)班</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">截止日期</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">作业内容</label>
                <textarea rows={4} placeholder="描述作业要求..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300 resize-none" />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Send size={16} /> 发布作业
              </button>
            </div>
          </div>

          {/* 最近作业列表 */}
          <div className="space-y-3">
            <h2 className="font-bold text-gray-800">最近作业</h2>
            {MOCK_HOMEWORKS.map((hw) => (
              <div key={hw.id} className="card p-4 cursor-pointer hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{hw.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    hw.status === '进行中' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>{hw.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{hw.class} · 截止 {hw.due}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(hw.submitted / hw.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{hw.submitted}/{hw.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'review' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 作业列表 */}
          <div className="col-span-1 space-y-2">
            <h2 className="font-bold text-gray-800 mb-3">待批改</h2>
            {MOCK_HOMEWORKS.map((hw) => (
              <div key={hw.id} onClick={() => setSelectedHw(hw.id)}
                className={`card p-3 cursor-pointer transition-colors ${
                  selectedHw === hw.id ? 'border-indigo-300 ring-1 ring-indigo-200' : ''
                }`}
              >
                <h3 className="font-medium text-sm text-gray-800">{hw.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{hw.submitted}/{hw.total} 已提交</p>
              </div>
            ))}
          </div>

          {/* 提交列表 */}
          <div className="col-span-2">
            <div className="card">
              {selectedHw ? (
                <div>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">学生提交</h3>
                    <span className="text-xs text-gray-400">{MOCK_SUBMISSIONS.filter(s => s.status !== '未提交').length} 份待批改</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {MOCK_SUBMISSIONS.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {s.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.time || '未提交'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.status === '未提交' ? (
                            <span className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded">未提交</span>
                          ) : s.status === '已批改' ? (
                            <span className="text-sm font-bold text-green-600">{s.score}</span>
                          ) : (
                            <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                              批改
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <Edit3 size={32} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">选择左侧作业开始批改</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">作业记录</h2>
          <div className="space-y-3">
            {MOCK_HOMEWORKS.map((hw) => (
              <div key={hw.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <ClipboardList size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{hw.title}</p>
                    <p className="text-xs text-gray-400">{hw.class} · 提交率 {Math.round(hw.submitted / hw.total * 100)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">平均分</p>
                  <p className="text-xs text-gray-400">--</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
