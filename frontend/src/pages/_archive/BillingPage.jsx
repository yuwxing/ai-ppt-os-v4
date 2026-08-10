import React from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Check } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: '免费',
    price: '¥0',
    period: '',
    features: ['每日3次生成', '基础模板', '基础PPT导出'],
    cta: '开始使用',
    color: 'gray',
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: '¥29',
    period: '/月',
    features: ['每日100次生成', '所有模板', '教师引导语生成', 'AI配图配乐', '动画效果', '优先生成队列'],
    cta: '升级Pro',
    color: 'blue',
    popular: true,
  },
  {
    id: 'pro_yearly',
    name: 'Pro 年付',
    price: '¥290',
    period: '/年',
    features: ['Pro全部功能', '节省2个月费用', '早鸟功能体验'],
    cta: '升级年付',
    color: 'indigo',
  },
  {
    id: 'school_yearly',
    name: '学校版',
    price: '¥2999',
    period: '/年',
    features: ['无限生成', '全部功能', 'API接入', '自定义模板和品牌', '专属客服', '教师账号批量管理'],
    cta: '联系开通',
    color: 'purple',
  },
];

export default function BillingPage() {
  const navigate = useNavigate();

  const handleCheckout = async (planId) => {
    if (planId === 'free') {
      navigate('/auth');
      return;
    }

    try {
      const res = await client.post(`/billing/create-checkout?plan=${planId}`);
      window.location.href = res.data.url;
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        alert('开通失败：' + (err.response?.data?.detail || '请重试'));
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-2">选择适合你的套餐</h2>
      <p className="text-gray-500 text-center mb-10">从免费到学校版，满足不同场景需求</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-white p-6 rounded-xl shadow-sm card-hover relative ${
            plan.popular ? 'ring-2 ring-blue-500' : ''
          }`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                推荐
              </span>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {plan.price}<span className="text-lg text-gray-400">{plan.period}</span>
            </p>
            <ul className="my-6 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(plan.id)}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'gradient-primary text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
