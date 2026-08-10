import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Play, ClipboardList, FileCheck, BarChart3,
  Sparkles, GraduationCap, ArrowRight, Brain, Zap, Shield, Edit3
} from 'lucide-react';

const CARDS = [
  { path: '/prep',    label: 'AI备课',   icon: BookOpen,    desc: 'AI一键生成教案与PPT课件',     badge: 'AI' },
  { path: '/teach',   label: 'AI上课',   icon: Play,        desc: '互动课堂，实时反馈',           badge: null },
  { path: '/grading', label: 'AI-Wego阅卷', icon: GraduationCap, desc: 'AI智能阅卷，支持所有网阅系统，自动批改提交', badge: '新' },
  { path: '/homework',label: '作业',     icon: ClipboardList, desc: '智能作业布置与批改',           badge: null },
  { path: '/writing-coach/', label: 'AI写作教练', icon: Edit3, desc: 'AI指导写作，提升写作能力',     badge: '新', external: true },
  { path: '/test',    label: '检测',     icon: FileCheck,   desc: '在线测验与智能组卷',           badge: null },
  { path: '/evaluate',label: '评价',     icon: BarChart3,   desc: '学情分析与综合评价',           badge: null },
];

const GRADIENT_MAP = {
  '/prep': 'from-indigo-500 to-purple-600',
  '/teach': 'from-emerald-500 to-teal-600',
  '/grading': 'from-amber-500 to-orange-600',
  '/homework': 'from-blue-500 to-cyan-600',
  '/writing-coach/': 'from-pink-500 to-rose-600',
  '/test': 'from-rose-500 to-pink-600',
  '/evaluate': 'from-violet-500 to-purple-600',
};

const FEATURES = [
  { icon: Brain, title: 'AI驱动', desc: '基于最新AI大模型，智能高效' },
  { icon: Zap, title: '极速体验', desc: '5秒生成课件，秒级阅卷' },
  { icon: Shield, title: '安全可靠', desc: '数据加密存储，安全无忧' },
];

const CARD_ICONS = {
  '/prep': BookOpen,
  '/teach': Play,
  '/grading': GraduationCap,
  '/homework': ClipboardList,
  '/writing-coach/': Edit3,
  '/test': FileCheck,
  '/evaluate': BarChart3,
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Wego
            </span>
            <span className="text-xs bg-gradient-to-r from-amber-400 to-pink-500 text-white px-3 py-1 rounded-full font-semibold">
              V5
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            智慧教育平台
          </h1>
          <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto mb-4">
            AI赋能教学全流程 —— 备课、上课、阅卷、作业、检测、评价
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/auth')}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all">
              立即体验
            </button>
            <button onClick={() => navigate('/grading')}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all">
              了解阅卷系统
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map((card) => {
            const Icon = CARD_ICONS[card.path];
            const gradient = GRADIENT_MAP[card.path];
            return (
              <button key={card.path} onClick={() => card.external ? window.location.href = card.path : navigate(card.path)}
                className="group relative bg-white rounded-2xl p-6 text-left shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {card.label}
                  </h3>
                  {card.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-bold">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  进入 <ArrowRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 py-8">
        <p className="text-xs text-gray-400 text-center">© 2026 AI-Wego. All rights reserved.</p>
      </div>
    </div>
  );
}
