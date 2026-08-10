import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, FileImage, Brain, Play, CheckCircle, XCircle, Loader2,
  Upload, Link, ExternalLink, BarChart3, BookOpen, Sparkles,
  Clock, Award, ChevronRight, Trash2, Plus, Download
} from 'lucide-react';

const MODES = [
  { id: 'online', label: '网阅模式', icon: Globe, desc: '连接外部阅卷系统，自动批改提交' },
  { id: 'local', label: '本地阅卷', icon: FileImage, desc: '上传答题卡照片/PDF，AI自动批改留痕' },
];

const SUBJECTS = ['语文','数学','英语','物理','化学','生物','历史','地理','政治'];
const GRADE_LEVELS = ['小学一年级','小学二年级','小学三年级','小学四年级','小学五年级','小学六年级','初中一年级','初中二年级','初中三年级','高中一年级','高中二年级','高中三年级'];

const DEMO_TASKS = [
  { id: 'demo-1', title: '八年级期中考试 - 数学', status: 'completed', mode: 'online', subject: '数学', grade_level: '初中二年级', total_sheets: 128, graded_sheets: 128, external_url: 'https://zhixue.com/grade/demo1', result: { average: 82.5, max: 100, min: 32 }, error_message: null },
  { id: 'demo-2', title: '高三月考 - 英语', status: 'completed', mode: 'local', subject: '英语', grade_level: '高中三年级', total_sheets: 96, graded_sheets: 96, external_url: null, result: { average: 78.3, max: 98, min: 28 }, error_message: null },
  { id: 'demo-3', title: '七年级语文单元测试', status: 'running', mode: 'online', subject: '语文', grade_level: '初中一年级', total_sheets: 85, graded_sheets: 52, external_url: 'https://haofenshu.com/test/demo', result: null, error_message: null },
  { id: 'demo-4', title: '高一物理期末考试', status: 'completed', mode: 'local', subject: '物理', grade_level: '高中一年级', total_sheets: 72, graded_sheets: 72, external_url: null, result: { average: 75.8, max: 96, min: 22, standard_answers_used: true, standard_answers_count: 25 }, error_message: null },
  { id: 'demo-5', title: '初三化学 - 期中考试', status: 'completed', mode: 'online', subject: '化学', grade_level: '初中三年级', total_sheets: 110, graded_sheets: 110, external_url: 'https://xueke.com/grading/demo', result: { average: 80.1, max: 99, min: 15 }, error_message: null },
  { id: 'demo-6', title: '初二物理 - 单元测试', status: 'failed', mode: 'local', subject: '物理', grade_level: '初中二年级', total_sheets: 60, graded_sheets: 0, external_url: null, result: null, error_message: '图片识别失败：第3组图片清晰度不足，请重新上传' },
];

const DEMO_STATS = { total_tasks: 6, completed_tasks: 4, total_sheets: 551 };

export default function GradingPage() {
  const [tab, setTab] = useState('dashboard');
  const [mode, setMode] = useState('online');
  const switchTab = (t) => { setTab(t); setGradingError(''); };
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, total_sheets: 0 });
  const [isDemo, setIsDemo] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [localSubject, setLocalSubject] = useState('');
  const [localGrade, setLocalGrade] = useState('');
  const [files, setFiles] = useState([]);
  const [localAnswers, setLocalAnswers] = useState('');
  const [answerFile, setAnswerFile] = useState(null);
  const [gradingError, setGradingError] = useState('');
  const fileRef = useRef(null);
  const answerRef = useRef(null);
  const pollRef = useRef(null);

  const hasRunning = () => tasks.some(t => t.status === 'running' || t.status === 'pending');

  const doPoll = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      if (!hasRunning()) { clearInterval(pollRef.current); pollRef.current = null; return; }
      fetchTasks(); fetchStats();
    }, 2000);
  };

  useEffect(() => {
    if (!isDemo) { fetchTasks(); fetchStats(); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (tab === 'tasks' && hasRunning()) doPoll();
    else if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, [tab, tasks]);

  const handleDemo = () => {
    setIsDemo(true);
    setGradingError('');
    setTasks(DEMO_TASKS);
    setStats(DEMO_STATS);
    switchTab('tasks');
  };

  const fetchTasks = async () => {
    if (isDemo) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/grading/tasks', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTasks(await res.json());
    } catch {}
  };

  const fetchStats = async () => {
    if (isDemo) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/grading/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const handleConnect = async () => {
    if (!externalUrl) return;
    setGradingError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/grading/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ url: externalUrl, title: '阅卷 - ' + new Date().toLocaleString() }),
      });
      if (res.ok) {
        setExternalUrl('');
        fetchTasks();
        switchTab('tasks');
      } else {
        const err = await res.json().catch(() => ({ error: '连接失败' }));
        setGradingError(err.error || '连接失败');
      }
    } catch (e) {
      setGradingError('网络错误，请重试');
    } finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setGradingError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // 读取所有文件为 base64
      const fileReader = (f) => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve({ name: f.name, type: f.type, size: f.size, data: r.result.split(',')[1] });
        r.onerror = () => reject();
        r.readAsDataURL(f);
      });
      const fileData = await Promise.all(files.map(fileReader));
      let answerKeyData = null;
      if (answerFile) {
        const r = await fileReader(answerFile);
        answerKeyData = r;
      }
      const res = await fetch('/api/grading/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          title: localTitle || ('本地阅卷 - ' + files.length + ' 份'),
          subject: localSubject,
          grade_level: localGrade,
          standard_answers: localAnswers,
          files: fileData,
          answer_key: answerKeyData,
        }),
      });
      if (res.ok) {
        setFiles([]);
        setLocalTitle('');
        setLocalAnswers('');
        setAnswerFile(null);
        if (fileRef.current) fileRef.current.value = '';
        if (answerRef.current) answerRef.current.value = '';
        fetchTasks();
        fetchStats();
        switchTab('tasks');
      } else {
        const err = await res.json().catch(() => ({ error: '上传失败' }));
        setGradingError(err.error || '上传失败');
      }
    } catch (e) {
      setGradingError('网络错误，请重试');
    } finally { setLoading(false); }
  };

  const handleStartGrading = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/grading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task_id: taskId }),
      });
      fetchTasks();
    } catch {}
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/grading/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch {}
  };

  const StatusBadge = ({ status }) => {
    if (status === 'pending') return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">等待中</span>;
    if (status === 'running') return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">阅卷中</span>;
    if (status === 'completed') return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">已完成</span>;
    return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">失败</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI-Wego阅卷</h1>
        <p className="text-gray-400 mt-1">AI智能阅卷系统 - 支持所有网阅系统，智能批改，自动提交</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 size={18} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total_tasks}</p>
          <p className="text-xs text-gray-400 mt-1">阅卷任务</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.completed_tasks}</p>
          <p className="text-xs text-gray-400 mt-1">已完成</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileImage size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total_sheets}</p>
          <p className="text-xs text-gray-400 mt-1">批改份数</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        <button onClick={() => switchTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus size={16} /> 新建阅卷
        </button>
        <button onClick={() => { switchTab('tasks'); fetchTasks(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={16} /> 任务列表
        </button>
        <button onClick={handleDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition text-emerald-600 hover:bg-emerald-50">
          <Play size={14} /> 演示数据
        </button>
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`card p-5 text-left transition-all ${
                    isActive ? 'ring-2 ring-indigo-500 border-indigo-500' : 'hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{m.label}</h3>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card p-6">
            {mode === 'online' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Globe size={18} className="text-indigo-500" />
                  <span>连接阅卷系统</span>
                </div>
                <p className="text-xs text-gray-400">输入您使用的阅卷系统地址（智学网、好分数、学科网、云痕等），AI-Wego将自动接入并开始阅卷</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
                    placeholder="例如: https://zhixue.com/grade/..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                  />
                  <button onClick={handleConnect} disabled={loading || !externalUrl}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
                    连接并创建任务
                  </button>
                </div>
                {gradingError && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">
                    <XCircle size={14} /> {gradingError}
                    <button onClick={() => setGradingError('')} className="ml-auto"><XCircle size={14} /></button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {['智学网', '好分数', '学科网', '云痕', '七天网络', '阅卷大师'].map(name => (
                    <button key={name} onClick={() => setExternalUrl(`https://${name}.com/`)}
                      className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full border border-gray-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <FileImage size={18} className="text-indigo-500" />
                  <span>上传答题卡</span>
                </div>
                <p className="text-xs text-gray-400">支持 PDF、JPG、PNG 格式，手机拍照的答题卡照片即可使用</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">任务标题</label>
                    <input value={localTitle} onChange={e => setLocalTitle(e.target.value)}
                      placeholder="例如: 期中数学考试" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">科目</label>
                      <select value={localSubject} onChange={e => setLocalSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                      >
                        <option value="">选择科目</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">年级</label>
                      <select value={localGrade} onChange={e => setLocalGrade(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-300"
                      >
                        <option value="">选择年级</option>
                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition cursor-pointer"
                  onClick={() => fileRef.current?.click()}>
                  <Upload size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">点击上传答题卡文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持 PDF、JPG、PNG</p>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFiles(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </div>
                {files.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 mb-2">
                      <span className="text-sm text-gray-600">已选择 {files.length} 个文件</span>
                      <button onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ''; }}
                        className="text-xs text-red-400 hover:text-red-600">清空</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(files).slice(0, 6).map((f, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          {f.type?.startsWith('image/') ? (
                            <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover"
                              onLoad={e => setTimeout(() => URL.revokeObjectURL(e.target.src), 5000)} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FileImage size={24} />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center truncate px-1">
                            {f.name}
                          </div>
                        </div>
                      ))}
                      {files.length > 6 && (
                        <div className="w-20 h-20 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                          +{files.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 标准答案+分值 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-sm">标准答案与分值设置</span>
                  </div>
                  <textarea value={localAnswers} onChange={e => setLocalAnswers(e.target.value)}
                    placeholder={'填写每道题的标准答案、分值和题型，每行一题：\n1. A  2分  客观\n2. 光合作用  3分  客观\n3. 简述光合作用的意义  5分  主观\n\n格式：题号. 答案  分值  题型(客观/主观)'}
                    className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-300 resize-none font-mono" />
                  {localAnswers.trim() && (() => {
                    const lines = localAnswers.trim().split('\n').filter(l => l.trim());
                    const parsed = lines.map((l, i) => {
                      const m = l.match(/^(\d+)[.、]\s*(.+?)(?:\s+(\d+)\s*分)?(?:\s*[\[【（(]?\s*(客观|主观|客|主)\s*[\]】）)]?)?$/);
                      return m ? { num: m[1], answer: m[2], score: m[3] || '?', type: m[4] || '客观' } : null;
                    }).filter(Boolean);
                    const totalScore = parsed.reduce((s, p) => s + (parseInt(p.score) || 0), 0);
                    return parsed.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        解析到 {parsed.length} 题，总分 {totalScore} 分
                        {parsed.filter(p => p.type?.includes('主')).length > 0 && '（含' + parsed.filter(p => p.type?.includes('主')).length + '道主观题）'}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" onClick={() => answerRef.current?.click()}
                      className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
                      {answerFile ? '已选参考答案图片' : '上传参考答案图片'}
                    </button>
                    {answerFile && <span className="text-xs text-gray-400">{answerFile.name}</span>}
                    <input ref={answerRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setAnswerFile(f); }}
                      className="hidden" />
                  </div>
                </div>

                {gradingError && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">
                    <XCircle size={14} /> {gradingError}
                    <button onClick={() => setGradingError('')} className="ml-auto"><XCircle size={14} /></button>
                  </div>
                )}
                <button onClick={handleUpload} disabled={loading || files.length === 0}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  {files.length > 0 ? '开始阅卷' : '上传并创建阅卷任务'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Brain size={20} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">全学科支持</h3>
              <p className="text-xs text-gray-400 mt-1">小学、初中、高中全学科，所有题型</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles size={20} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">AI智能批改</h3>
              <p className="text-xs text-gray-400 mt-1">5秒1道题，精准高效</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Award size={20} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">一键统计报告</h3>
              <p className="text-xs text-gray-400 mt-1">自动生成成绩分析报告</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="card p-12 text-center">
              <FileImage size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">暂无阅卷任务，点击上方"新建阅卷"开始</p>
            </div>
          ) : tasks.map(t => (
            <div key={t.id} className="card p-4 hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.mode === 'online' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {t.mode === 'online'
                      ? <Globe size={20} className="text-blue-600" />
                      : <FileImage size={20} className="text-amber-600" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{t.title}</h3>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.mode === 'online' ? '网阅模式' : '本地阅卷'}
                      {t.subject ? ` · ${t.subject}` : ''}
                      {t.grade_level ? ` · ${t.grade_level}` : ''}
                      {t.total_sheets > 0 ? ` · ${t.graded_sheets}/${t.total_sheets} 份` : ''}
                      {t.external_url ? ` · ${t.external_url.slice(0, 30)}...` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.status === 'pending' && (
                    <button onClick={() => handleStartGrading(t.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Play size={12} /> 开始阅卷
                    </button>
                  )}
                  {t.status === 'completed' && (
                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Download size={12} /> 查看报告
                    </button>
                  )}
                  <button onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-gray-200" />
                </div>
              </div>
              {t.status === 'running' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                    <Loader2 size={12} className="animate-spin" />
                    正在阅卷 {t.graded_sheets}/{t.total_sheets} 份...
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${t.total_sheets > 0 ? (t.graded_sheets / t.total_sheets) * 100 : 0}%` }} />
                  </div>
                </div>
              )}
              {t.status === 'completed' && t.result?.average && (
                <div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>平均分: <strong className="text-gray-800">{t.result.average.toFixed(1)}</strong></span>
                    <span>最高分: <strong className="text-green-600">{t.result.max}</strong></span>
                    <span>最低分: <strong className="text-red-500">{t.result.min}</strong></span>
                    {t.result.total_score > 0 && <span>满分: <strong className="text-gray-800">{t.result.total_score}</strong></span>}
                    {t.result.standard_answers_used && (
                      <span className="text-emerald-500">标准答案 {t.result.standard_answers_count}题</span>
                    )}
                  </div>
                  {t.result.questions && t.result.questions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.result.questions.map(q => (
                        <span key={q.num} className={'text-[10px] px-1.5 py-0.5 rounded ' + (q.correct_rate >= 70 ? 'bg-green-50 text-green-600' : q.correct_rate >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500')}>
                          {q.num}题 {q.correct_rate}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {t.status === 'failed' && (
                <p className="mt-2 text-xs text-red-500">{t.error_message}</p>
              )}
            </div>
          ))}
          {tasks.length > 0 && (
            <p className="text-xs text-gray-400 text-center pt-2">
              共 {tasks.length} 个任务
              <button onClick={fetchTasks} className="ml-2 text-indigo-500 hover:underline">刷新</button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
