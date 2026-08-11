import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startLessonPlan, getLessonStatus, ocrImage } from '../api/ai';
import { localOcrImage } from '../utils/localOcr';
import { createLesson } from '../api/lessons';
import agents from '../data/agents.json';
import DEMO_RESULT from '../data/demoResult';
import { Sparkles, Loader2, CheckCircle, Clock, BookOpen, Users, Target, BarChart3, AlertCircle, Play, Camera, X } from 'lucide-react';


const CLASS_FLOW = [
  { time: '5分钟', phase: '情境导入', desc: '激发兴趣，引入课题', icon: '🎬' },
  { time: '10分钟', phase: '自主探究', desc: '学生主动探索新知', icon: '🔍' },
  { time: '15分钟', phase: '合作学习', desc: '小组协作，深化理解', icon: '🤝' },
  { time: '5分钟', phase: '评价反馈', desc: '课堂练习，即时反馈', icon: '📝' },
  { time: '5分钟', phase: '总结提升', desc: '梳理知识，升华主题', icon: '🎯' },
];

// 课型 → 课型 Agent → Skill 流水线（V1：与后端 agents/registry.py 对齐）
// '智能识别' = 后端 LessonRouter 自动路由到对应课型 Agent
const LESSON_TYPE_AGENTS = {
  '':         { name: '🤖 智能识别', note: '根据课题/教材内容自动匹配最优课型 Agent', skills: null },
  '新授课':    { name: '🧠 新授课智能体', note: '新知识讲解：导入→呈现→练习→总结', skills: ['📚教材分析','🧠知识点提取','🎯教学目标','⚠️重点难点','🎬情境导入','📖新知呈现','🤝课堂活动','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '阅读课':    { name: '📖 阅读课智能体', note: '文本分析→结构→策略→问题链→迁移', skills: ['📚教材分析','🎯教学目标','🔍阅读文本分析','🧱文章结构分析','🧭阅读策略','❓问题链设计','🤝课堂活动','🎚️分层教学','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '听说课':    { name: '🎧 听说课智能体', note: '听前预测→倾听→模仿→输出', skills: ['📚教材分析','🎯教学目标','🎧听力任务分析','🗣️语音难点','🔄三听流程','💬口语输出','❓问题链设计','🤝课堂活动','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '语法课':    { name: '🧩 语法课智能体', note: '规则发现→操练→运用', skills: ['📚教材分析','🧠知识点提取','🎯教学目标','⚠️重点难点','🔎语法规则发现','🔁语法分层操练','⚠️易错辨析','🤝课堂活动','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '写作课':    { name: '✍️ 写作课智能体', note: '审题→体裁→范文→句型→评价', skills: ['📚教材分析','🎯教学目标','✍️审题分析','📄体裁分析','📑范文拆解','💬句型积累','📏评分标准','🤝课堂活动','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '复习课':    { name: '🔄 复习课智能体', note: '知识网络→错题→迁移', skills: ['📚教材分析','🧠知识点提取','🎯教学目标','⚠️重点难点','❓问题链设计','🤝课堂活动','🎚️分层教学','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '试卷讲评':  { name: '📋 讲评课智能体', note: '错题诊断→分层讲评', skills: ['📚教材分析','🧠知识点提取','🎯教学目标','⚠️重点难点','❓问题链设计','🤝课堂活动','🎚️分层教学','📋作业设计','🗂️PPT结构','🔍课件质检'] },
  '单元整合':  { name: '🗂️ 单元整合智能体', note: '单元知识体系→任务链→升华', skills: ['📚教材分析','🧠知识点提取','🎯教学目标','⚠️重点难点','🧩任务链','🌈主题升华','📝评价设计','📋作业设计','🗂️PPT结构','🔍课件质检'] },
};

export default function GeneratePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const [form, setForm] = useState({
    subject: searchParams.get('subject') || '英语',
    grade: searchParams.get('grade') || '七年级',
    book: '人教版',
    lesson_type: '新授课',
    lesson_period: '',
    topic: searchParams.get('topic') || '',
    textbook_content: '',
    template_style: searchParams.get('template') || 'story-magic',
  });
  // 课件模板：'' 自动识别 | 'manatee' 公开课阅读课范式
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [stepName, setStepName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  // 当前课型的 Skill 执行序列（V2：读取课型工作台面板，用于动态渲染执行进度）
  const [activeSkills, setActiveSkills] = useState(null);
  const pollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 把课型工作台面板的 "📚教材分析" 拆成 {icon, name} 对象
  const skillFromConfig = (sk) => {
    if (typeof sk === 'string') {
      const icon = sk.match(/^(\p{Extended_Pictographic})/u);
      return { icon: icon ? icon[1] : '•', name: icon ? sk.slice(icon[1].length) : sk, task: '' };
    }
    return sk;
  };
  // 从当前选中课型解析出要执行的 Skill 序列
  const currentSkillList = () => {
    const cfg = LESSON_TYPE_AGENTS[form.lesson_type] || LESSON_TYPE_AGENTS[''];
    if (cfg && cfg.skills) return cfg.skills.map(skillFromConfig);
    return null;
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 课题与教材内容至少填一个；都没填则提示
    const hasTopic = !!form.topic.trim();
    const hasContent = !!(form.textbook_content && form.textbook_content.trim());
    const hasImages = uploadedImages.some(i => i.status === 'done' && i.data);
    if (!hasTopic && !hasContent && !hasImages) return;
    if (!localStorage.getItem('token')) { navigate('/auth'); return; }

    setLoading(true);
    setError('');
    setStep(0);
    setStepName('');
    setResult(null);
    setActiveSkills(currentSkillList());

    try {
      const imgs = uploadedImages.filter(i => i.status === 'done' && i.data).map(i => i.data);
      // 提交课题：优先用户填写；为空则从教材内容提取
      const finalTopic = form.topic.trim() || extractTopicFromText(form.textbook_content) || '我的备课方案';
      const data = await startLessonPlan({ ...form, topic: finalTopic, images: imgs, template });
      const taskId = data.task_id;
      setStepName('正在启动 AI 教研组...');

      pollRef.current = setInterval(async () => {
        try {
          const status = await getLessonStatus(taskId);
          if (status.step) setStep(status.step);
          if (status.step_name) setStepName(status.step_name);

          if (status.status === 'done') {
            clearInterval(pollRef.current);
            setStep(10);
            setStepName('✅ 备课完成');
            setResult(status.result || status);
            setLoading(false);
          } else if (status.status === 'failed') {
            clearInterval(pollRef.current);
            setError(status.error || '备课失败');
            setLoading(false);
          }
        } catch (err) {
          clearInterval(pollRef.current);
          if (err.response?.status === 404) {
            setError('任务已过期或服务器已重启，请重新提交');
          } else {
            setError('查询任务状态失败');
          }
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === '任务不存在') {
        setError('任务已过期或服务器已重启，请重新提交');
      } else {
        setError(detail || '提交失败，请重试');
      }
      setLoading(false);
    }
  };

  const handleDemo = useCallback(async () => {
    setForm({
      subject: '物理', grade: '八年级', book: '人教版',
      lesson_type: '新授课', lesson_period: '第1课时',
      topic: '杠杆', textbook_content: ''
    });

    setLoading(true);
    setError('');
    setStep(0);
    setStepName('');

    await new Promise(r => setTimeout(r, 600));

    const demoAgentNames = [
      '正在启动 AI 教研组...',
      '📚 教材分析Agent - 分析教材知识结构、重难点',
      '🎯 学习目标Agent - 生成知识目标、能力目标、素养目标',
      '🧠 学情诊断Agent - 预测学生困难和错误概念',
      '🎬 情境创设Agent - 生成视频、图片、游戏导入',
      '🧩 任务链Agent - 设计由易到难的学习任务链',
      '🌈 主题升华Agent - 设计价值引领与情感升华',
      '👨‍🏫 教学流程Agent - 生成40分钟课堂流程安排',
      '🎮 游戏活动Agent - 设计课堂互动游戏与活动',
      '📝 评价设计Agent - 设计形成性评价与课堂反馈',
      '🎨 课件视觉Agent - 设计PPT版式、配色、动画',
      '🎙️ 多媒体资源Agent - 生成配图、动画、音频素材',
      '📋 作业设计Agent - 生成基础/拓展/实践分层作业',
      '🔍 质量审核Agent - 检查教学合理性与课标匹配',
      '✅ 备课完成'
    ];

    for (let i = 1; i < demoAgentNames.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      setStep(i);
      setStepName(demoAgentNames[i]);
    }

    setResult(DEMO_RESULT);
    setLoading(false);
  }, []);

  function compressImage(file, maxWidth = 2000, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) { height = height * maxWidth / width; width = maxWidth; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFiles = async (files) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const preview = URL.createObjectURL(file);
      const newImg = { id, file, preview, status: 'uploading', text: '' };
      setUploadedImages(prev => [...prev, newImg]);

      try {
        const compressed = await compressImage(file);
        setUploadedImages(prev => prev.map(i => i.id === id ? { ...i, status: 'ocr', data: compressed } : i));

        // ① 先尝试后端 OCR（需配置 DeepSeek API Key，识别最准）
        let text = '';
        let engine = 'server';
        try {
          const result = await ocrImage(compressed, {
            subject: form.subject, grade: form.grade, book: form.book,
          });
          text = result.text || '';
        } catch { text = ''; }

        // ② 后端返回空（无 Key 或识别失败）→ 用本地 Tesseract OCR（免费·无需密钥）
        if (!text.trim()) {
          engine = 'tesseract';
          try {
            text = await localOcrImage(compressed);
          } catch { text = ''; }
        }

        setUploadedImages(prev => prev.map(i => i.id === id ? { ...i, status: 'done', text: text || '', data: compressed, engine } : i));
        if (text && text.trim()) {
          setForm(prev => {
            const merged = (prev.textbook_content ? prev.textbook_content + '\n\n' : '') + text.trim();
            // 未填课题时自动从识别文本提取
            let topic = prev.topic;
            if (!topic.trim()) {
              topic = extractTopicFromText(text);
            }
            return { ...prev, textbook_content: merged, topic };
          });
        }
      } catch {
        setUploadedImages(prev => prev.map(i => i.id === id ? { ...i, status: 'error' } : i));
      }
    }
  };

  const handleFileChange = (e) => { handleFiles(e.target.files); e.target.value = ''; };

  const removeImage = (id) => {
    const img = uploadedImages.find(i => i.id === id);
    if (img?.preview) URL.revokeObjectURL(img.preview);
    setUploadedImages(prev => prev.filter(i => i.id !== id));
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // 判断是否 OCR 乱码（连续重复字母≥3次 或 全是单个字母堆叠）
  const isGarbledText = (s) => {
    if (!s) return true;
    // 连续重复 3+ 次：如 INNNNNNNR
    if (/([a-zA-Z])\1{2,}/.test(s)) return true;
    // 相邻字母交替且没有空格/元音，看起来像噪声
    const alpha = s.replace(/[^a-zA-Z]/g, '');
    if (alpha.length >= 5 && alpha.length === s.replace(/[^a-zA-Z\s]/g, '').length && !/\s/.test(s)) {
      // 全是字母无空格的长串，若缺少元音或重复比例高则判定噪声
      const vowels = (s.match(/[aeiouAEIOU]/g) || []).length;
      if (vowels / alpha.length < 0.15 && alpha.length >= 8) return true;
    }
    return false;
  };

  // 从 OCR 识别文本中自动提取课题（去掉编号/标点，跳过乱码行）
  const extractTopicFromText = (text) => {
    const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      let t = line
        .replace(/^[\d一二三四五六七八九十]+\s*[、.．:：]?\s*/, '')
        .replace(/^[（(]\s*[\d一二三四五六七八九十]+\s*[)）]\s*/, '')
        .replace(/[。！？!?；;]$/, '')
        .trim();
      // 去掉纯 Unit 编号标题行（如 "Unit 8"、"Unit 15 The Lost Dog"），它不是主题
      if (/^Unit\s*\d+/i.test(t)) continue;
      if (t.length >= 2 && t.length <= 40 && !isGarbledText(t)) return t;
    }
    // 全部乱码/无有效行时，返回空，让用户自行填写
    return '';
  };

  const saveAndView = async (result, topic, meta) => {
    try {
      const data = await createLesson({
        title: topic || '备课方案',
        meta: meta || {},
        content: result,
        slides: result.slides || []
      });
      navigate('/lessons/view/' + data.id);
    } catch (e) {
      alert('保存失败，请重试');
    }
  };

  const saveAndEdit = async (result, topic, meta) => {
    try {
      const data = await createLesson({
        title: topic || '备课方案',
        meta: meta || {},
        content: result,
        slides: result.slides || []
      });
      navigate('/lessons/edit/' + data.id);
    } catch (e) {
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      <div className="text-center mb-1">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-2xl md:text-3xl">👨‍🏫</span> AI教师团队正在设计本节课
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">输入课题，AI教研组全程协同备课</p>
      </div>

      {/* 输入区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">学科</label>
              <select value={form.subject} onChange={handleChange('subject')}
                className="w-full px-2 md:px-3 py-2 md:py-2.5 border border-gray-200 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                {['语文','数学','英语','物理','化学','生物','历史','地理','政治','科学'].map(s =>
                  <option key={s}>{s}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">年级</label>
              <select value={form.grade} onChange={handleChange('grade')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                {['一年级','二年级','三年级','四年级','五年级','六年级','七年级','八年级','九年级','高一','高二','高三'].map(s =>
                  <option key={s}>{s}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">教材</label>
              <select value={form.book} onChange={handleChange('book')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                {['人教版','北师大版','苏教版','沪教版','粤教版','鲁教版'].map(s =>
                  <option key={s}>{s}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">课型</label>
              <select value={form.lesson_type} onChange={handleChange('lesson_type')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                {['智能识别','新授课','阅读课','听说课','语法课','写作课','复习课','试卷讲评','单元整合'].map(s =>
                  <option key={s} value={s === '智能识别' ? '' : s}>{s}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">课时</label>
              <select value={form.lesson_period} onChange={handleChange('lesson_period')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                <option value="">整单元</option>
                {[1,2,3,4,5,6,7,8].map(n =>
                  <option key={n} value={`第${n}课时`}>第{n}课时</option>
                )}
              </select>
            </div>
          </div>

          {/* 课型智能体 + Skill 流水线（V1：课型 Agent 编排面板） */}
          {(() => {
            const ltConfig = LESSON_TYPE_AGENTS[form.lesson_type] || LESSON_TYPE_AGENTS[''];
            return (
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/50 p-3 md:p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-semibold text-indigo-700">{ltConfig.name}</span>
                    {ltConfig.skills && (
                      <span className="text-[11px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">已匹配 {ltConfig.skills.length} 个 Skill</span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">课型 Agent 工作台</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{ltConfig.note}</p>
                {ltConfig.skills ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ltConfig.skills.map((sk, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-white border border-indigo-100 text-gray-600 px-2 py-1 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">选择课型后，系统将锁定对应的课型智能体与本流水线 · 也可不选，由 AI 自动识别课型</p>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">课题</label>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <input type="text" value={form.topic}
                onChange={handleChange('topic')}
                placeholder="例如：杠杆、现在完成时、光合作用..."
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                disabled={loading} />
              <div className="flex gap-2">
                <button type="submit" disabled={loading || (!form.topic.trim() && !(form.textbook_content || '').trim())}
                  className="px-5 py-2.5 md:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md active:scale-[0.97] flex-shrink-0">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? '备课中...' : '开始AI备课'}
                </button>
                <button type="button" onClick={handleDemo} disabled={loading}
                  className="px-4 py-2.5 md:py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md active:scale-[0.97] flex-shrink-0 whitespace-nowrap">
                  <Play size={16} /> 演示数据
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">课件风格 <span className="text-gray-300 font-normal">（影响 PPT 整体配色与版式设计）</span></label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'story-magic', name: '故事魔法', c: '#F4A261' },
                { id: 'classic-education', name: '经典教学', c: '#2B5C8F' },
                { id: 'science-lab', name: '科学实验室', c: '#1A237E' },
                { id: 'premium-business', name: '商务精英', c: '#1B1F3B' },
                { id: 'storybook-amber', name: '琥珀故事', c: '#4F81BD' },
                { id: 'ocean-teal', name: '深海蓝绿', c: '#4BACC6' },
                { id: 'forest-green', name: '森林自然', c: '#548235' },
                { id: 'sunset-warm', name: '暖阳落日', c: '#C0504D' },
                { id: 'calm-lavender', name: '静谧紫韵', c: '#8064A2' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, template_style: t.id }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    form.template_style === t.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: t.c }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">课件模板 <span className="text-gray-300 font-normal">（英语阅读公开课使用 manatee 范式）</span></label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: '', name: '智能识别', desc: '自动匹配', c: '#64748b' },
                { id: 'manatee', name: '英语阅读公开课', desc: 'manatee 范式', c: '#0ea5e9' },
                { id: 'zhengjia-listening', name: '英语情境听说课', desc: '郑佳范式', c: '#f59e0b' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    template === t.id
                      ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: t.c }} />
                  {t.name}
                  <span className="text-gray-300 font-normal">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              教材原文 <span className="text-gray-300 font-normal">（拍照上传或粘贴课文内容，可选；AI自动识别文字并存入教材库，无需配置Key也能本地识别）</span>
            </label>

            {uploadedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-thin">
                {uploadedImages.map(img => (
                  <div key={img.id} className="relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={img.preview} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(img.id)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70">
                      <X size={10} className="text-white" />
                    </button>
                    <div className={`absolute bottom-0 left-0 right-0 text-center text-[10px] leading-tight py-0.5 ${
                      img.status === 'done' ? 'bg-green-500/80 text-white' : img.status === 'error' ? 'bg-red-500/80 text-white' : 'bg-indigo-500/80 text-white'
                    }`}>
                      {img.status === 'done'
                        ? (img.engine === 'tesseract' ? '✓ 本地识别' : '✓ 已识别')
                        : img.status === 'error' ? '识别失败' : img.status === 'ocr' ? '识别中...' : '上传中...'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <textarea value={form.textbook_content}
              onChange={handleChange('textbook_content')}
              rows={3}
              placeholder="粘贴或拍照上传教材原文，AI将基于实际教材生成同步课件..."
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 resize-none"
              disabled={loading} />

            <div className="flex gap-2 mt-2">
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" multiple
                onChange={handleFileChange} className="hidden" />
              <input ref={fileInputRef} type="file" accept="image/*" multiple
                onChange={handleFileChange} className="hidden" />
              <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50">
                <Camera size={14} /> 拍照上传
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50">
                🖼️ 从相册选择
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Agent 工作流面板 */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 animate-pulse" />
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {activeSkills ? (LESSON_TYPE_AGENTS[form.lesson_type] && LESSON_TYPE_AGENTS[form.lesson_type].name || '课型智能体') : 'AI教师团队'}
                </h3>
                <p className="text-xs text-gray-400">{stepName || '正在启动...'}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">{step}/{activeSkills ? activeSkills.length : 10}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(activeSkills || agents.map(a => ({ id: a.id, icon: a.icon, name: a.name, task: a.task }))).map((agent, i) => {
                const isActive = activeSkills ? step === i + 1 : step === agent.id;
                const isDone = activeSkills ? step > i + 1 : step > agent.id;
                const isPending = activeSkills ? step < i + 1 : step < agent.id;
                return (
                  <div key={activeSkills ? i : agent.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive ? 'border-indigo-300 bg-indigo-50 shadow-sm' :
                      isDone ? 'border-green-200 bg-green-50' :
                      'border-gray-100 bg-gray-50 opacity-50'
                    }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                      isDone ? 'bg-green-100' :
                      isActive ? 'bg-indigo-100 animate-pulse' : 'bg-gray-100'
                    }`}>
                      {isDone ? <CheckCircle size={20} className="text-green-500" /> : agent.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${
                        isDone ? 'text-green-700' : isActive ? 'text-indigo-700' : 'text-gray-400'
                      }`}>{agent.name}</p>
                      <p className="text-xs text-gray-400 truncate">{agent.task}</p>
                    </div>
                    {isActive && <Loader2 size={16} className="animate-spin text-indigo-500 flex-shrink-0" />}
                    {isDone && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 备课完成 */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* 40分钟课堂结构 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="p-4 md:p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                <Clock size={18} className="text-emerald-500" /> 40分钟课堂流程
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {CLASS_FLOW.map((f, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                    <span className="text-2xl block mb-1">{f.icon}</span>
                    <p className="text-xs font-bold text-emerald-600">{f.time}</p>
                    <p className="text-sm font-semibold text-gray-800">{f.phase}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 结果 + 下载 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">备课完成</h3>
                <p className="text-xs text-gray-400">课件已生成，可以下载或预览</p>
              </div>
            </div>
            {result._llm_error && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                <AlertCircle size={14} className="inline mr-1" />
                {result._llm_error}
                {!localStorage.getItem('ppt_master_api_key') && (
                  <span className="block mt-1">💡 在右上角设置中配置 DeepSeek API Key 后，可生成更丰富的 AI 课件方案。</span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <BookOpen size={20} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{result.pages || 0}</p>
                <p className="text-xs text-gray-400">课件页数</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Target size={20} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{form.subject}</p>
                <p className="text-xs text-gray-400">学科</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <BarChart3 size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{form.grade}</p>
                <p className="text-xs text-gray-400">年级</p>
              </div>
            </div>
            {result.teacher_guide && (
              <div className="p-4 bg-indigo-50 rounded-xl mb-4">
                <p className="font-semibold text-indigo-800 text-sm">📖 教师引导语已生成</p>
                <p className="text-indigo-600 text-xs mt-1">每页PPT都包含详细的教师教案和课堂活动设计</p>
              </div>
            )}

            {/* 主题升华 */}
            {result.theme_elevation && (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl mb-4 border border-pink-100">
                <p className="font-semibold text-pink-800 text-sm mb-2">🌈 主题升华</p>
                <p className="text-xs text-pink-600 mb-1"><span className="font-medium">核心价值：</span>{result.theme_elevation.core_value}</p>
                <p className="text-xs text-pink-600 mb-1"><span className="font-medium">形式：</span>{result.theme_elevation.format} · {result.theme_elevation.duration}</p>
                <p className="text-xs text-pink-600"><span className="font-medium">内容：</span>{result.theme_elevation.content}</p>
              </div>
            )}

            {/* 游戏活动 */}
            {result.games && result.games.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">🎮 课堂游戏活动</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.games.map((g, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-sm font-semibold text-amber-800">{g.name}</p>
                      <p className="text-xs text-amber-600 mt-0.5">{g.type} · {g.phase} · {g.duration}</p>
                      <p className="text-xs text-amber-700 mt-1">{g.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 分层作业 */}
            {result.homework && result.homework.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">📋 分层作业设计</p>
                <div className="space-y-2">
                  {['基础','拓展','实践'].map(tier => {
                    const items = result.homework.filter(h => h.tier === tier);
                    if (!items.length) return null;
                    return (
                      <div key={tier} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{tier}作业</p>
                        {items.map((h, i) => (
                          <p key={i} className="text-sm text-gray-700">• {h.title} <span className="text-xs text-gray-400">({h.estimated_time} · {h.difficulty})</span></p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => saveAndView(result, form.topic, result.meta || {})}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                <Play size={18} /> 查看课件
              </button>
              <button type="button" onClick={() => saveAndEdit(result, form.topic, result.meta || {})}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                <Sparkles size={18} /> 进入编辑器
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
