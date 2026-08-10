import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Loader2, FileText, Download } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
      return;
    }
    client.get('/users/me').then((res) => {
      setUser(res.data);
    }).catch(() => {
      localStorage.removeItem('token');
      navigate('/auth');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin inline-block" size={32} /></div>;
  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">控制台</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <p className="text-lg">欢迎回来，<strong>{user.username}</strong></p>
        <p className="text-gray-500 mt-1">
          当前套餐：<span className="font-semibold text-blue-600">{user.tier === 'school' ? '学校版' : user.tier === 'pro' ? 'Pro' : '免费'}</span>
        </p>
        <p className="text-gray-500">
          今日已用：{user.daily_used} / {user.daily_limit} 次
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${Math.min(100, (user.daily_used / user.daily_limit) * 100)}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <a href="/generate"
          className="bg-white p-6 rounded-xl shadow-sm card-hover flex items-center gap-4">
          <FileText size={32} className="text-blue-600" />
          <div>
            <h3 className="font-semibold">生成新PPT</h3>
            <p className="text-gray-500 text-sm">输入主题，AI自动生成</p>
          </div>
        </a>
        <a href="/templates"
          className="bg-white p-6 rounded-xl shadow-sm card-hover flex items-center gap-4">
          <Download size={32} className="text-green-600" />
          <div>
            <h3 className="font-semibold">模板市场</h3>
            <p className="text-gray-500 text-sm">选择模板快速生成</p>
          </div>
        </a>
      </div>
    </div>
  );
}
