import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Sparkles, Zap, Layers, Cpu } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isLogin ? '/users/login' : '/users/register';
      const body = isLogin
        ? { username: form.username, password: form.password }
        : form;
      const res = await client.post(url, body);
      localStorage.setItem('token', res.data.access_token);
      if (res.data.user_id) {
        localStorage.setItem('user', JSON.stringify({ id: res.data.user_id, username: form.username }));
      }
      console.log('Login success, token stored');
      navigate('/prep', { replace: true });
    } catch (err) {
      console.error('Login error:', err.response?.status, err.response?.data, err.message);
      setError(err.response?.data?.detail || '操作失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 -mx-4 -mt-4 p-4 flex items-center justify-center">
      <div className="flex max-w-5xl w-full gap-8 items-center">
        {/* 左侧：API 计量付费介绍 */}
        <div className="flex-1 hidden lg:block">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI 备课中心
            </h1>
            <p className="text-lg text-gray-500">
              按 API 计量付费 · 用多少付多少
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Zap, title: '免费额度', desc: '注册即享 1000 API 调用次数，零成本体验全部功能' },
              { icon: Cpu, title: '按量计费', desc: '超出后按 API 调用次数计费，¥0.01/次，不设最低消费' },
              { icon: Layers, title: '弹性扩容', desc: '无需预购套餐，高峰期自动扩容，低谷期零费用' },
              { icon: Sparkles, title: '透明账单', desc: '实时 API 用量仪表盘，每笔调用均可追溯，无隐藏费用' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium">API 计量模式的优势</p>
            <p className="text-xs text-indigo-500 mt-1">
              每次生成课件、智能批改、语音合成均按实际 API 资源消耗计费。
              相比固定套餐，中小用户可节省 60% 以上成本。
            </p>
          </div>
        </div>

        {/* 右侧：登录/注册表单 */}
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {isLogin ? '欢迎回来' : '开始使用'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isLogin ? '登录后查看 API 用量与课件' : '注册即送 1,000 次免费 API 调用'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="用户名" value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition" required />
              {!isLogin && (
                <input type="email" placeholder="邮箱" value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition" required />
              )}
              <input type="password" placeholder="密码" value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition" required />
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 text-sm">
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">或</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 ml-1 hover:underline font-medium">
                {isLogin ? '免费注册' : '登录'}
              </button>
            </p>

            <p className="text-center text-xs text-gray-400 mt-4">
              注册即表示同意 <span className="text-gray-500 hover:text-indigo-600 cursor-pointer">服务条款</span> 和 <span className="text-gray-500 hover:text-indigo-600 cursor-pointer">隐私政策</span>
            </p>
          </div>

          <div className="text-center mt-4">
            <span className="text-xs text-gray-400">
              测试账号: demo / demo123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
