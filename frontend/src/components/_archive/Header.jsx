import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Presentation, Store, BarChart3, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/generate', label: '生成PPT', icon: <Presentation size={16} /> },
  { path: '/market', label: '模板市场', icon: <Store size={16} /> },
  { path: '/analytics', label: '数据分析', icon: <BarChart3 size={16} /> },
  { path: '/classroom', label: 'AI课堂', icon: <GraduationCap size={16} /> },
];

export default function Header() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  return (
    <header className="glass border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI PPT OS
          </span>
          <span className="text-xs bg-gradient-to-r from-amber-400 to-pink-500 text-white px-2 py-0.5 rounded-full font-semibold">V5</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition font-medium">
              <LayoutDashboard size={16} /> 控制台
            </Link>
          ) : (
            <Link to="/auth" className="btn-primary !px-5 !py-2 !text-sm">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
