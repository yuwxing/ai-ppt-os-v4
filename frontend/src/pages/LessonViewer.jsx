import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Maximize2, Loader2, BookOpen, Target, Clock } from 'lucide-react';

export default function LessonViewer() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/lessons/' + id);
        if (res.ok) setLesson(await res.json());
      } finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, lesson]);

  useEffect(() => { setPage(0); }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="animate-spin text-indigo-400" size={40} /></div>;
  if (!lesson) return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-400">课件不存在</div>;

  const result = lesson.content || lesson;
  const meta = result.meta || {};
  const guides = Array.isArray(result.teacher_guide) ? result.teacher_guide : [];
  const games = result.games || [];
  const homework = result.homework || [];
  const te = result.theme_elevation;
  const contentSlides = Array.isArray(result.slides) ? result.slides : [];

  // 优先展示 result.slides（完整教学环节：阅读任务链/重点句式/思维导图等）
  const slides = [];
  if (contentSlides.length) {
    slides.push({ type: 'title', data: { topic: lesson.title || result.topic, meta } });
    contentSlides.forEach((s, i) => {
      slides.push({ type: 'content', data: { ...s, index: i + 1 } });
    });
    if (games.length) slides.push({ type: 'games', data: games });
    if (homework.length) slides.push({ type: 'homework', data: homework });
    if (te) slides.push({ type: 'theme', data: te });
  } else {
    slides.push({ type: 'title', data: { topic: lesson.title || result.topic, meta } });
    guides.forEach((g, i) => slides.push({ type: 'guide', data: { ...g, index: i + 1 } }));
    if (games.length) slides.push({ type: 'games', data: games });
    if (homework.length) slides.push({ type: 'homework', data: homework });
    if (te) slides.push({ type: 'theme', data: te });
  }

  const go = (n) => { setPage(Math.max(0, Math.min(n, slides.length - 1))); };
  const next = () => go(page + 1);
  const prev = () => go(page - 1);
  const toggleFS = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setFullscreen(true); } else { document.exitFullscreen(); setFullscreen(false); } };

  const slide = slides[page];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/prep" className="hover:text-indigo-600"><ChevronLeft size={18} /></Link>
          <span className="font-medium text-gray-800 truncate max-w-[300px]">{lesson.title}</span>
          <span className="text-xs text-gray-400">{page + 1}/{slides.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFS} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><Maximize2 size={16} /></button>
        </div>
      </div>

      <div className="flex items-center justify-center p-4" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="relative w-full max-w-5xl h-full bg-white rounded-2xl shadow-lg overflow-hidden">
          {slide.type === 'title' && (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-col items-center justify-center text-white p-12">
              <h1 className="text-4xl font-bold text-center mb-4">{slide.data.topic}</h1>
              <p className="text-lg text-indigo-200">{meta.subject} · {meta.grade} · {meta.book}{meta.lesson_type ? ' · ' + meta.lesson_type : ''}</p>
              {meta.lesson_period && <p className="text-sm text-indigo-300 mt-2">{meta.lesson_period}</p>}
            </div>
          )}

          {slide.type === 'content' && (
            <div className="w-full h-full p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">{slide.data.index}</div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{slide.data.title}</h2>
                  {slide.data.goal && <p className="text-xs text-gray-400 mt-0.5">{slide.data.goal}</p>}
                </div>
              </div>
              <div className="space-y-3">
                {Array.isArray(slide.data.content) && slide.data.content.map((c, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{String(c)}</p>
                  </div>
                ))}
                {slide.data.narrative && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">🎙️ 教师口播</p>
                    <p className="text-sm text-indigo-900">{slide.data.narrative}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {slide.type === 'guide' && (
            <div className="w-full h-full p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">{slide.data.index}</div>
                <div>
                  <h2 className="font-bold text-gray-800">第 {slide.data.index} 页</h2>
                  <p className="text-xs text-gray-400">{slide.data.time_allocation || '—'}</p>
                </div>
              </div>
              <div className="space-y-6">
                {slide.data.teacher_script && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-500 mb-1">教师</p>
                    <p className="text-sm text-indigo-900">{slide.data.teacher_script}</p>
                  </div>
                )}
                {slide.data.student_activity && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-500 mb-1">学生活动</p>
                    <p className="text-sm text-emerald-900">{slide.data.student_activity}</p>
                  </div>
                )}
                {slide.data.questions && slide.data.questions.length > 0 && (
                  <div className="space-y-2">
                    {slide.data.questions.map((q, i) => (
                      <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-semibold text-amber-500 mb-1">问题 {i + 1}</p>
                        <p className="text-sm text-amber-900">{q.question}</p>
                        {q.expected_answer && <p className="text-xs text-amber-600 mt-1">答案：{q.expected_answer}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {slide.type === 'games' && (
            <div className="w-full h-full p-8 md:p-12 overflow-y-auto">
              <h2 className="font-bold text-gray-800 text-lg mb-6">课堂游戏活动</h2>
              <div className="grid gap-4">
                {slide.data.map((g, i) => (
                  <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-amber-800">{g.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-700">{g.duration}</span>
                    </div>
                    <p className="text-xs text-amber-600 mb-2">{g.type} · {g.phase}</p>
                    <p className="text-sm text-amber-900">{g.description}</p>
                    {g.materials?.length > 0 && <p className="text-xs text-amber-500 mt-2">材料：{g.materials.join('、')}</p>}
                    {g.learning_goal && <p className="text-xs text-amber-600 mt-1">目标：{g.learning_goal}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide.type === 'homework' && (
            <div className="w-full h-full p-8 md:p-12 overflow-y-auto">
              <h2 className="font-bold text-gray-800 text-lg mb-6">分层作业设计</h2>
              <div className="space-y-3">
                {['基础', '拓展', '实践'].map(tier => {
                  const items = slide.data.filter(h => h.tier === tier);
                  if (!items.length) return null;
                  return (
                    <div key={tier} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">{tier}作业</p>
                      <div className="space-y-1.5">
                        {items.map((h, i) => (
                          <p key={i} className="text-sm text-gray-700">• {h.title} <span className="text-xs text-gray-400">（{h.estimated_time} · {h.difficulty}）</span></p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {slide.type === 'theme' && (
            <div className="w-full h-full p-8 md:p-12 overflow-y-auto bg-gradient-to-br from-pink-50 to-rose-50">
              <h2 className="font-bold text-gray-800 text-lg mb-2">主题升华</h2>
              <p className="text-sm text-pink-600 mb-6">{slide.data.format} · {slide.data.duration}</p>
              <div className="p-6 bg-white/80 rounded-2xl border border-pink-100">
                <p className="text-lg font-semibold text-pink-800 mb-3">{slide.data.core_value}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{slide.data.content}</p>
              </div>
            </div>
          )}

          <div className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-w-resize" onClick={prev} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-e-resize" onClick={next} />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={'h-1.5 rounded-full transition-all ' + (i === page ? 'w-8 bg-indigo-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400')} />
            ))}
          </div>

          <div className="absolute top-4 right-4 z-20">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 text-gray-500 shadow-sm">{page + 1}/{slides.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
