import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Play, ClipboardList, FileCheck, BarChart3,
  Sparkles, LogOut, User, ChevronLeft, ChevronRight, Menu, GraduationCap, X, Key
} from 'lucide-react';

const MODULES = [
  { id: 'prep',    path: '/prep',    label: '备课',   icon: BookOpen,    badge: 'AI' },
  { id: 'teach',   path: '/teach',   label: '上课',   icon: Play,        badge: null },
  { id: 'grading', path: '/grading', label: '阅卷',   icon: GraduationCap, badge: 'AI' },
  { id: 'homework',path: '/homework',label: '作业',   icon: ClipboardList, badge: null },
  { id: 'test',    path: '/test',    label: '检测',   icon: FileCheck,   badge: null },
  { id: 'evaluate',path: '/evaluate',label: '评价',   icon: BarChart3,   badge: null },
];

export default function SmartLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const [keyModal, setKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(!!localStorage.getItem('ppt_master_api_key'));
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const activeModule = MODULES.find(m => location.pathname.startsWith(m.path))?.id;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  function saveKey() {
    if (!keyInput.trim()) return;
    localStorage.setItem('ppt_master_api_key', keyInput.trim());
    setHasKey(true);
    setKeyModal(false);
    setKeyInput('••••••••');
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm">PPT Master</span>
        </Link>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <Link key={m.id} to={m.path} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <div className="relative flex-shrink-0">
                <Icon size={20} />
                {m.badge && (
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-gradient-to-r from-amber-400 to-pink-500 text-white px-1 rounded font-bold">
                    {m.badge}
                  </span>
                )}
              </div>
              <span>{m.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        {token ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user.username?.[0] || 'U'}
              </div>
              <span className="text-xs text-white/70 truncate">{user.username || '用户'}</span>
            </div>
            <button onClick={handleLogout} className="sidebar-item w-full text-white/50 hover:text-red-400">
              <LogOut size={16} />
              <span>退出登录</span>
            </button>
          </div>
        ) : (
          <Link to="/auth" className="sidebar-item">
            <User size={16} />
            <span>登录</span>
          </Link>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-gray-800 p-1">
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm text-gray-700">
              {MODULES.find(m => m.id === activeModule)?.label || 'AI-Wego'}
            </span>
          </div>
          <button onClick={() => setKeyModal(true)}
            className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition ${
              hasKey
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
            <Key size={11} />
            {hasKey ? 'Key' : 'API Key'}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        <aside style={{
          position: 'fixed', left: mobileOpen ? 0 : -280, top: 0,
          width: 280, height: '100vh', zIndex: 50,
          background: 'linear-gradient(180deg, #111827, #1f2937)',
          color: 'white', display: 'flex', flexDirection: 'column',
          transition: 'left 0.3s ease'
        }}>
          {sidebarContent}
        </aside>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col relative`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
          {collapsed ? (
            <Link to="/" className="mx-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-bold text-sm">PPT Master</span>
            </Link>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <Link key={m.id} to={m.path} className={`sidebar-item ${isActive ? 'active' : ''}`} title={collapsed ? m.label : undefined}>
                <div className="relative flex-shrink-0">
                  <Icon size={20} />
                  {m.badge && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-gradient-to-r from-amber-400 to-pink-500 text-white px-1 rounded font-bold">{m.badge}</span>
                  )}
                </div>
                {!collapsed && <span>{m.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-2">
          {token ? (
            <div className="space-y-1">
              <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user.username?.[0] || 'U'}
                </div>
                {!collapsed && <span className="text-xs text-white/70 truncate">{user.username || '用户'}</span>}
              </div>
              <button onClick={handleLogout} className="sidebar-item w-full text-white/50 hover:text-red-400" title="退出登录">
                <LogOut size={16} />
                {!collapsed && <span>退出登录</span>}
              </button>
            </div>
          ) : (
            <Link to="/auth" className="sidebar-item">
              <User size={16} />
              {!collapsed && <span>登录</span>}
            </Link>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-14 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <span className="text-sm text-gray-400">
            {MODULES.find(m => m.id === activeModule)?.label || 'AI-Wego'}
          </span>
          <div className="flex items-center gap-3">
            {token && (
              <span className="text-xs text-gray-400">
                API 用量: <span className="text-indigo-600 font-medium">0</span> 次
              </span>
            )}
            <button onClick={() => setKeyModal(true)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                hasKey
                  ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}>
              <Key size={12} />
              {hasKey ? 'API Key' : '配置API Key'}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* API Key Modal */}
      {keyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                <Key size={18} /> 配置 API Key
              </h3>
              <button onClick={() => setKeyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">你的 API Key 仅存储在浏览器本地，不会上传到服务器之外的地方。</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1 leading-relaxed">
              <p className="font-medium text-gray-700">获取 DeepSeek API Key：</p>
              <p>1. 打开 https://platform.deepseek.com/ 注册账号</p>
              <p>2. 登录后进入 "API Keys" 页面</p>
              <p>3. 点击 "创建 API Key"，复制并粘贴到下方</p>
            </div>
            <input value={keyInput} onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-300 mb-4" />
            <div className="flex gap-3">
              <button onClick={saveKey}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                保存
              </button>
              <button onClick={() => setKeyModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
