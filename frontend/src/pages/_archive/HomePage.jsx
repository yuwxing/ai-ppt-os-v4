import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Rocket, School, Presentation, BarChart3, Users, Video, BrainCircuit, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="gradient-hero text-white rounded-3xl p-12 md:p-20 mb-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-float-delayed" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-8">
          <Sparkles size={16} className="text-yellow-300" />
          <span>AI PPT OS V5 Pro — 下一代AI课件引擎</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          AI生成
          <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">专业PPT</span>
          <br />快如闪电
        </h1>
        <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          输入主题，AI自动完成内容策划、视觉设计、配图配乐、动画效果<br />
          17个AI智能体协作，3分钟生成一份完整课件
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/generate" className="btn-primary text-lg">
            <Rocket size={22} /> 开始生成PPT
          </Link>
          <Link to="/market" className="btn-outline !border-white !text-white hover:!bg-white/10 text-lg">
            进入系统 <ArrowRight size={20} />
          </Link>
        </div>
        <div className="flex justify-center gap-8 mt-12 text-sm text-indigo-300">
          <span className="flex items-center gap-1"><CheckCircle size={14} /> 无需注册</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} /> 每日3次免费</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} /> .pptx导出</span>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {[
        { icon: <Presentation size={24} />, value: '3,120+', label: 'PPT已生成', color: 'text-indigo-600' },
        { icon: <Users size={24} />, value: '86', label: '活跃教师', color: 'text-purple-600' },
        { icon: <TrendingUp size={24} />, value: '82%', label: '使用率', color: 'text-pink-600' },
        { icon: <Star size={24} />, value: '65%', label: '节省时间', color: 'text-amber-600' },
      ].map((s, i) => (
        <div key={i} className="stat-card text-center">
          <div className={`${s.color} mb-2 flex justify-center`}>{s.icon}</div>
          <div className="text-3xl font-bold text-gray-800">{s.value}</div>
          <div className="text-gray-500 text-sm">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function FeaturesSection() {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-4">核心能力</h2>
      <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">从内容到成稿，AI全流程自动化</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: <BrainCircuit size={28} />, title: 'AI自动生成PPT', desc: '输入主题，17个AI智能体协作完成课件' },
          { icon: <School size={28} />, title: '教学中心', desc: 'AI备课、交互课件、课堂播放一站式教学平台', badge: '新', link: '/lessons' },
          { icon: <Sparkles size={28} />, title: '模板市场', desc: '海量专业模板，支持上传售卖（即将上线）', badge: '新' },
          { icon: <Video size={28} />, title: 'PPT → 视频', desc: '一键将PPT转为教学视频，支持配音讲解' },
          { icon: <Users size={28} />, title: 'AI讲课老师', desc: '虚拟教师自动讲解，可定制语音和形象' },
          { icon: <BarChart3 size={28} />, title: '教学数据分析', desc: '学生学习数据可视化，精准定位薄弱点' },
          { icon: <School size={28} />, title: '学校SaaS版', desc: '教师账号管理、批量采购、自定义品牌' },
        ].map((f, i) => (
          <div key={i} className="feature-card relative">
            {f.badge && <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">{f.badge}</span>}
            <div className="text-indigo-600 mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
            {f.link && (
              <Link to={f.link} className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                进入教学中心 <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <div className="mb-16 bg-gradient-to-b from-white to-indigo-50 rounded-3xl p-10">
      <h2 className="text-3xl font-bold text-center mb-4">三步生成PPT</h2>
      <p className="text-gray-500 text-center mb-10">极简操作，AI完成所有复杂工作</p>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {[
          { step: '01', title: '输入主题', desc: '输入课程名称或主题关键词', color: 'from-indigo-500 to-purple-600' },
          { step: '02', title: 'AI自动生成', desc: '17个智能体协作完成内容与设计', color: 'from-purple-500 to-pink-600' },
          { step: '03', title: '下载PPT', desc: '导出标准.pptx文件，可直接使用', color: 'from-pink-500 to-rose-600' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${s.color} text-white text-2xl font-bold flex items-center justify-center shadow-lg`}>
              {s.step}
            </div>
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSection() {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-center mb-4">选择适合的方案</h2>
      <p className="text-gray-500 text-center mb-10">免费体验，升级解锁全部功能</p>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <PricingCard
          title="免费"
          price="¥0"
          features={['每日3次生成', '基础模板', '标准导出']}
          cta="开始使用"
          ctaLink="/auth"
        />
        <PricingCard
          title="Pro"
          price="¥29/月"
          features={['每日100次生成', '全部模板', '教师引导语', 'AI配图配乐', '动画效果', 'PPT转视频']}
          cta="升级Pro"
          ctaLink="/billing"
          featured
        />
        <PricingCard
          title="学校版"
          price="¥2999/年"
          features={['无限生成', '全部功能', 'API接入', '自定义模板', '教师账号管理', '专属客服', '数据分析']}
          cta="联系开通"
          ctaLink="/billing"
        />
      </div>
    </div>
  );
}

function PricingCard({ title, price, features, cta, ctaLink, featured }) {
  return (
    <div className={`rounded-2xl p-8 ${featured ? 'bg-gradient-to-b from-indigo-50 to-purple-50 ring-2 ring-indigo-500 shadow-xl scale-105' : 'bg-white border border-gray-100 shadow-sm'} card-hover`}>
      {featured && <div className="text-center text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full px-3 py-1 inline-block mb-3">最受欢迎</div>}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="text-4xl font-bold text-indigo-600 mb-6">{price}</div>
      <ul className="mb-8 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link to={ctaLink} className={`block text-center py-3 rounded-xl font-semibold transition ${featured ? 'gradient-primary text-white shadow-lg hover:shadow-xl' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
        {cta}
      </Link>
    </div>
  );
}
