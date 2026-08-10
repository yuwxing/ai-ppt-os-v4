import React, { useState } from 'react';
import { FileCheck, Plus, Clock, Award, CheckCircle, XCircle, HelpCircle, ChevronRight } from 'lucide-react';

const MOCK_TESTS = [
  { id: 1, title: 'Unit 8 单元测验', type: '单元测试', questions: 20, duration: 45, status: '未开始', class: '七年级(1)班' },
  { id: 2, title: '过去时态专项练习', type: '随堂练习', questions: 15, duration: 20, status: '进行中', class: '七年级(1)班' },
  { id: 3, title: '期中模拟考试', type: '考试', questions: 50, duration: 90, status: '已结束', class: '七年级(2)班' },
];

const MOCK_QUESTIONS = [
  { id: 1, text: 'She ___ to school yesterday.', type: '单选', options: ['go', 'goes', 'went', 'going'], answer: 2 },
  { id: 2, text: 'They ___ (play) football last Sunday.', type: '填空', answer: 'played' },
  { id: 3, text: '将下列句子改为过去时：I eat breakfast at 7am.', type: '简答', answer: 'I ate breakfast at 7am.' },
];

export default function TestPage() {
  const [tab, setTab] = useState('tests');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">检测</h1>
        <p className="text-gray-400 mt-1">创建测验、组织考试、智能批改</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-full sm:w-fit overflow-x-auto">
        {[
          { id: 'tests', label: '测验列表', icon: FileCheck },
          { id: 'create', label: '创建测验', icon: Plus },
          { id: 'results', label: '成绩统计', icon: Award },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setShowCreate(id === 'create'); }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'tests' && (
        <div className="space-y-3">
          {MOCK_TESTS.map((t) => (
            <div key={t.id} className="card p-4 flex items-center justify-between hover:border-indigo-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.status === '未开始' ? 'bg-blue-100' : t.status === '进行中' ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <FileCheck size={20} className={`${
                    t.status === '未开始' ? 'text-blue-600' : t.status === '进行中' ? 'text-amber-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.type} · {t.questions} 题 · {t.duration} 分钟 · {t.class}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  t.status === '未开始' ? 'bg-blue-100 text-blue-600' :
                  t.status === '进行中' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                }`}>{t.status}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* 左侧：题目列表 */}
          <div className="col-span-3 card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-gray-800">题目列表</h2>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {[
                  { label: '单选题', color: 'bg-blue-500' },
                  { label: '填空题', color: 'bg-emerald-500' },
                  { label: '简答题', color: 'bg-purple-500' },
                ].map(({ label, color }) => (
                  <button key={label} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {MOCK_QUESTIONS.map((q, i) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{q.type}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{q.text}</p>
                  {q.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                          <input type="radio" name={`q${q.id}`} className="text-indigo-600" />
                          {String.fromCharCode(65 + oi)}. {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：设置 */}
          <div className="col-span-2 card p-5">
            <h2 className="font-bold text-gray-800 mb-4">测验设置</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">测验标题</label>
                <input placeholder="输入标题" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300" />
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
                  <label className="text-xs text-gray-400 block mb-1">限时(分钟)</label>
                  <input type="number" defaultValue={45} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">题目</label>
                <p className="text-sm text-gray-600">已添加 3 题</p>
              </div>
              <button className="btn-primary w-full">保存并发布</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">成绩统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '总测验数', value: '12', color: 'indigo' },
              { label: '参与学生', value: '124', color: 'emerald' },
              { label: '平均分', value: '85.6', color: 'amber' },
              { label: '优秀率', value: '42%', color: 'rose' },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center py-8 text-gray-400">
            <Award size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">详细成绩分析功能即将上线</p>
          </div>
        </div>
      )}
    </div>
  );
}
