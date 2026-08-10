import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLesson, createLesson, updateLesson, importLessonFromJson, getDefaultTemplate } from '../api/lessons';
import { generateSlideWithAI } from '../api/ai';
import {
  Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, Copy,
  Loader2, ChevronLeft, FileText, Sparkles, Image, Type,
  Layout, ListOrdered, HelpCircle, BookOpen, Globe
} from 'lucide-react';

const PAGE_TYPES = [
  { id: 'cover', icon: '📖', label: '封面', desc: '课程封面与标题' },
  { id: 'warmup', icon: '🔥', label: '热身', desc: '导入环节，引起兴趣' },
  { id: 'vocabulary', icon: '📝', label: '词汇', desc: '单词卡片与短语' },
  { id: 'story', icon: '📚', label: '故事', desc: '叙事内容' },
  { id: 'animation', icon: '🎬', label: '动画', desc: '场景动画展示' },
  { id: 'grammar', icon: '📐', label: '语法', desc: '语法规则讲解' },
  { id: 'reading', icon: '👁️', label: '读写', desc: '阅读与写作' },
  { id: 'speaking', icon: '🎤', label: '口语', desc: '角色扮演对话' },
  { id: 'game', icon: '🎮', label: '游戏', desc: '问答闯关复习' },
  { id: 'summary', icon: '🌟', label: '总结', desc: '课堂总结升华' },
  { id: 'homework', icon: '📋', label: '作业', desc: '课后拓展任务' },
];

const STYLE_THEMES = [
  { id: 'story-magic', name: '故事魔法', primary: '#F4A261', secondary: '#2A9D8F', accent: '#E76F51', bg: '#FFF3E0', text: '#264653' },
  { id: 'classic-education', name: '经典教学', primary: '#2B5C8F', secondary: '#5B9BD5', accent: '#E8751A', bg: '#FFFFFF', text: '#333333' },
  { id: 'science-lab', name: '科学实验室', primary: '#1A237E', secondary: '#00BCD4', accent: '#76FF03', bg: '#F5F5F5', text: '#212121' },
  { id: 'premium-business', name: '商务精英', primary: '#1B1F3B', secondary: '#C9A84C', accent: '#4A4E69', bg: '#FAFAFA', text: '#1A1A1A' },
  // 从本地PPT文件提取的配色
  { id: 'storybook-amber', name: '琥珀故事', primary: '#4F81BD', secondary: '#C0504D', accent: '#9BBB59', bg: '#FFF8F0', text: '#333333' },
  { id: 'ocean-teal', name: '深海蓝绿', primary: '#4BACC6', secondary: '#F79646', accent: '#8064A2', bg: '#F0F8FA', text: '#264653' },
  { id: 'forest-green', name: '森林自然', primary: '#548235', secondary: '#BF8F00', accent: '#ED7D31', bg: '#F5F9F0', text: '#333333' },
  { id: 'sunset-warm', name: '暖阳落日', primary: '#C0504D', secondary: '#F79646', accent: '#9BBB59', bg: '#FFF8F0', text: '#4A3728' },
  { id: 'calm-lavender', name: '静谧紫韵', primary: '#8064A2', secondary: '#4BACC6', accent: '#F79646', bg: '#F8F5FF', text: '#333333' },
];

const emptySlide = (type) => ({
  component: type,
  title: '',
  emotion: '好奇',
  goal: '',
  narrative: '',
  content: [''],
});

export default function LessonEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [lesson, setLesson] = useState({
    title: '',
    subject: '',
    grade: '',
    textbook: '',
    unit: '',
    template_style: 'story-magic',
    slides: [],
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getLesson(Number(id)).then((data) => {
        setLesson({
          title: data.title,
          subject: data.subject,
          grade: data.grade,
          textbook: data.textbook,
          unit: data.unit,
          template_style: data.template_style,
          slides: data.slides || [],
        });
      }).catch(() => navigate('/lessons'));
    }
  }, [id]);

  const markDirty = useCallback(() => setDirty(true), []);

  const updateMeta = (field, value) => {
    setLesson((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const updateSlide = (index, field, value) => {
    setLesson((prev) => {
      const slides = [...prev.slides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, slides };
    });
    markDirty();
  };

  const addSlide = (type) => {
    setLesson((prev) => {
      const slides = [...prev.slides, emptySlide(type)];
      return { ...prev, slides };
    });
    setCurrentSlide(lesson.slides.length);
    markDirty();
  };

  const removeSlide = (index) => {
    if (lesson.slides.length <= 1) return;
    setLesson((prev) => {
      const slides = prev.slides.filter((_, i) => i !== index);
      return { ...prev, slides };
    });
    if (currentSlide >= index && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    markDirty();
  };

  const moveSlide = (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= lesson.slides.length) return;
    setLesson((prev) => {
      const slides = [...prev.slides];
      [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
      return { ...prev, slides };
    });
    setCurrentSlide(newIndex);
    markDirty();
  };

  const duplicateSlide = (index) => {
    setLesson((prev) => {
      const slides = [...prev.slides];
      slides.splice(index + 1, 0, { ...slides[index], title: slides[index].title + ' (复制)' });
      return { ...prev, slides };
    });
    setCurrentSlide(index + 1);
    markDirty();
  };

  const addContentItem = (index) => {
    setLesson((prev) => {
      const slides = [...prev.slides];
      slides[index] = { ...slides[index], content: [...slides[index].content, ''] };
      return { ...prev, slides };
    });
    markDirty();
  };

  const updateContentItem = (slideIdx, itemIdx, value) => {
    setLesson((prev) => {
      const slides = [...prev.slides];
      const content = [...slides[slideIdx].content];
      content[itemIdx] = value;
      slides[slideIdx] = { ...slides[slideIdx], content };
      return { ...prev, slides };
    });
    markDirty();
  };

  const removeContentItem = (slideIdx, itemIdx) => {
    setLesson((prev) => {
      const slides = [...prev.slides];
      const content = slides[slideIdx].content.filter((_, i) => i !== itemIdx);
      slides[slideIdx] = { ...slides[slideIdx], content: content.length ? content : [''] };
      return { ...prev, slides };
    });
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: lesson.title || '未命名课件',
        subject: lesson.subject,
        grade: lesson.grade,
        textbook: lesson.textbook,
        unit: lesson.unit,
        template_style: lesson.template_style,
        slides: lesson.slides,
      };
      if (isNew) {
        const result = await createLesson(payload);
        navigate(`/lessons/edit/${result.id}`, { replace: true });
      } else {
        await updateLesson(Number(id), payload);
      }
      setDirty(false);
    } catch (e) {
      alert('保存失败: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  const loadFromTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const data = await getDefaultTemplate();
      setLesson((prev) => ({
        ...prev,
        title: data.title || prev.title,
        subject: data.subject || prev.subject,
        grade: data.grade || prev.grade,
        textbook: data.textbook || prev.textbook,
        unit: data.unit || prev.unit,
        template_style: data.template_style || prev.template_style,
        slides: data.slides || prev.slides,
      }));
      setCurrentSlide(0);
      markDirty();
    } catch (e) {
      alert('加载模板失败: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setLoadingTemplate(false);
    }
  };

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiGenerate = async () => {
    const slide = lesson.slides[currentSlide];
    if (!slide || aiGenerating) return;
    setAiGenerating(true);
    setAiError('');
    try {
      const pageType = slide.component;
      const pageLabel = PAGE_TYPES.find(p => p.id === pageType)?.label;
      const context = lesson.slides
        .filter((_, i) => i !== currentSlide)
        .map(s => s.title).filter(Boolean).slice(0, 5).join('；');
      const data = await generateSlideWithAI({
        topic: lesson.title,
        subject: lesson.subject,
        grade: lesson.grade,
        pageType,
        pageLabel,
        context,
      });
      if (data?.title || data?.content) {
        updateSlide(currentSlide, 'title', data.title || slide.title);
        updateSlide(currentSlide, 'narrative', data.narrative || slide.narrative);
        updateSlide(currentSlide, 'goal', data.goal || slide.goal);
        updateSlide(currentSlide, 'content', Array.isArray(data.content) && data.content.length ? data.content : slide.content);
      } else {
        setAiError('AI 未返回内容，请重试或检查 API Key');
      }
    } catch (e) {
      setAiError('AI 生成失败: ' + (e?.response?.data?.error || e.message));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonText);
      const imported = importLessonFromJson(data);
      setLesson((prev) => ({
        ...prev,
        title: imported.title || prev.title,
        subject: imported.subject || prev.subject,
        grade: imported.grade || prev.grade,
        textbook: imported.textbook || prev.textbook,
        unit: imported.unit || prev.unit,
        template_style: imported.template_style || prev.template_style,
        slides: imported.slides || prev.slides,
      }));
      setShowJsonImport(false);
      setJsonText('');
      markDirty();
    } catch (e) {
      alert('JSON 格式错误: ' + e.message);
    }
  };

  const slide = lesson.slides[currentSlide];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] -mx-4 -mt-4">
      {/* 左侧：页面列表 */}
      <div className="w-full lg:w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate('/lessons')} className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <input
              value={lesson.title}
              onChange={(e) => updateMeta('title', e.target.value)}
              placeholder="课件标题"
              className="flex-1 font-semibold text-gray-800 bg-transparent border-0 outline-none placeholder-gray-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            {STYLE_THEMES.map((t) => (
              <button key={t.id}
                onClick={() => updateMeta('template_style', t.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition ${
                  lesson.template_style === t.id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="flex gap-0.5">
                  <span key={0} className="w-2 h-2 rounded-full" style={{ background: t.primary }} />
                  <span key={1} className="w-2 h-2 rounded-full" style={{ background: t.secondary }} />
                  <span key={2} className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {lesson.slides.map((s, i) => (
            <div key={i}
              onClick={() => setCurrentSlide(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition group ${
                currentSlide === i ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{PAGE_TYPES.find((p) => p.id === s.component)?.icon || '📄'}</span>
              <span className="flex-1 truncate">{s.title || `第${i + 1}页`}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, -1); }} className="p-0.5 hover:text-indigo-600"><ArrowUp size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 1); }} className="p-0.5 hover:text-indigo-600"><ArrowDown size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); duplicateSlide(i); }} className="p-0.5 hover:text-indigo-600"><Copy size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); removeSlide(i); }} className="p-0.5 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* 添加页面按钮 */}
        <div className="p-3 border-t border-gray-100">
          <div className="relative group">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition">
              <Plus size={18} /> 添加页面
            </button>
            <div className="absolute bottom-full left-0 right-0 mb-2 hidden group-hover:block z-10">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-2 gap-1">
                {PAGE_TYPES.map((pt) => (
                  <button key={pt.id} onClick={() => addSlide(pt.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition text-left"
                  >
                    <span>{pt.icon}</span>
                    <div>
                      <p className="font-medium">{pt.label}</p>
                      <p className="text-gray-400">{pt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 中间：编辑器 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {slide ? (
          <>
            {/* 编辑器顶栏 */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
              <span className="text-xl">{PAGE_TYPES.find((p) => p.id === slide.component)?.icon}</span>
              <select
                value={slide.component}
                onChange={(e) => updateSlide(currentSlide, 'component', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
              >
                {PAGE_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.label}</option>
                ))}
              </select>
              <button onClick={handleAiGenerate} disabled={aiGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50">
                <Sparkles size={14} /> {aiGenerating ? '生成中...' : 'AI 生成本页'}
              </button>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">{currentSlide + 1} / {lesson.slides.length}</span>
            </div>

            {aiError && (
              <div className="px-4 py-2 bg-rose-50 text-rose-600 text-xs border-b border-rose-100">
                {aiError}
              </div>
            )}

            {/* 编辑区 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* 标题 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">页面标题</label>
                <input value={slide.title} onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                  placeholder="输入页面标题" className="w-full text-lg font-bold text-gray-800 border-0 outline-none bg-transparent placeholder-gray-300" />
              </div>

              {/* 叙事文本 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">叙事 / 引导语</label>
                <textarea value={slide.narrative} onChange={(e) => updateSlide(currentSlide, 'narrative', e.target.value)}
                  rows={3} placeholder="教师引导学生时的说话内容"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-300 resize-none placeholder-gray-300" />
              </div>

              {/* 教学目标 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">教学目标</label>
                <input value={slide.goal} onChange={(e) => updateSlide(currentSlide, 'goal', e.target.value)}
                  placeholder="本页的学习目标" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-300 placeholder-gray-300" />
              </div>

              {/* 情感标签 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">情感氛围</label>
                <div className="flex flex-wrap gap-2">
                  {['好奇', '期待', '温暖', '惊喜', '紧张转鼓舞', '轻松', '感悟', '兴奋', '挑战'].map((em) => (
                    <button key={em} onClick={() => updateSlide(currentSlide, 'emotion', em)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        slide.emotion === em ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >{em}</button>
                  ))}
                </div>
              </div>

              {/* 内容要点 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400">内容要点</label>
                  <button onClick={() => addContentItem(currentSlide)} className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                    <Plus size={14} /> 添加要点
                  </button>
                </div>
                <div className="space-y-2">
                  {slide.content.map((item, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center">{ci + 1}</span>
                      <input value={item} onChange={(e) => updateContentItem(currentSlide, ci, e.target.value)}
                        placeholder={`要点 ${ci + 1}`} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-300 placeholder-gray-300" />
                      <button onClick={() => removeContentItem(currentSlide, ci)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-lg font-medium mb-1">开始创作课件</p>
              <p className="text-sm text-gray-400 mb-6">点击左侧「添加页面」或直接加载模板示例</p>
              <div className="flex gap-3 justify-center">
                <button onClick={loadFromTemplate} disabled={loadingTemplate}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingTemplate ? <Loader2 size={18} className="animate-spin" /> : <Copy size={18} />}
                  {loadingTemplate ? '加载中...' : '加载模板示例'}
                </button>
                <button onClick={() => setShowJsonImport(true)}
                  className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >从 JSON 导入</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：实时预览 */}
      <div className="hidden lg:block w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-white">
          <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <Eye size={14} /> 实时预览
          </p>
        </div>
        <div className="flex-1 p-3 overflow-hidden">
          {slide ? (
            <div className="w-full h-full rounded-lg overflow-hidden shadow-sm border border-gray-200"
              style={{ background: getPreviewBg(slide.component, lesson.template_style) }}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">{slide.emotion}</span>
                  <div className="flex gap-1">
                    {slide.content.slice(0, 3).map((_, i) => (
                      <span key={i} className="w-1 h-1 rounded-full bg-white/30" />
                    ))}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-tight">{slide.title || '无标题'}</h3>
                <p className="text-xs text-white/70 mb-3 leading-relaxed line-clamp-3">{slide.narrative}</p>
                <div className="flex-1 space-y-1.5">
                  {slide.content.filter(Boolean).slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/20 text-white text-[8px] flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-[11px] text-white/80 line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
                {slide.goal && (
                  <div className="mt-2 text-center">
                    <span className="inline-block px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/60">🎯 {slide.goal}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              选择页面预览
            </div>
          )}
        </div>
      </div>

      {/* JSON 导入弹窗 */}
      {showJsonImport && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowJsonImport(false)}>
          <div className="bg-white rounded-2xl p-6 w-[600px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2">从 JSON 导入课件</h3>
            <p className="text-xs text-gray-400 mb-4">粘贴 lesson.json 格式的内容，一键导入已有课件模板</p>
            <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)}
              rows={12} className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono text-gray-700 outline-none focus:border-indigo-300 resize-none"
              placeholder='{"meta":{"title":"..."},"slides":[...]}' />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowJsonImport(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">取消</button>
              <button onClick={handleJsonImport} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">导入</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部保存栏 */}
      <div className="fixed bottom-0 left-0 lg:left-24 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{lesson.slides.length} 页</span>
          <span>{lesson.slides.filter((s) => s.title).length} 页已命名</span>
          {dirty && <span className="text-amber-500">● 未保存</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/lessons')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >取消</button>
          <button onClick={() => !isNew && navigate(`/lessons/play/${id}`)}
            disabled={isNew}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <Eye size={16} className="inline mr-1" />预览
          </button>
          <button onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? '保存中...' : '保存课件'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPreviewBg(comp, style) {
  const theme = STYLE_THEMES.find(t => t.id === style) || STYLE_THEMES[0];
  const { primary, secondary, accent, bg } = theme;
  const map = {
    cover: `linear-gradient(135deg,${primary},${secondary})`,
    warmup: `linear-gradient(135deg,${secondary},${primary}dd)`,
    vocabulary: `linear-gradient(180deg,${secondary}33,${secondary}66)`,
    story: `linear-gradient(135deg,${primary}dd,${accent}aa)`,
    animation: `linear-gradient(135deg,${primary},${accent})`,
    grammar: `linear-gradient(135deg,${secondary}44,${accent}44)`,
    reading: `linear-gradient(135deg,${bg},${secondary}33)`,
    speaking: `linear-gradient(135deg,${primary}cc,${accent}cc)`,
    game: `linear-gradient(135deg,${primary},${accent}cc)`,
    summary: `linear-gradient(135deg,${primary}dd,${secondary})`,
    homework: `linear-gradient(135deg,${secondary}66,${primary}44)`,
  };
  return map[comp] || bg;
}
