import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLesson } from '../api/lessons';
import { ChevronLeft, Maximize2, Loader2, Edit2, ChevronRight, Volume2 } from 'lucide-react';

const emojiMap = {
  '好奇': '🔍', '期待': '🌟', '温暖': '☀️', '惊喜': '✨',
  '紧张转鼓舞': '💪', '轻松': '😊', '感悟': '💭', '兴奋': '🎉', '挑战': '⚡',
};

const compEmoji = {
  cover: '📖', warmup: '🤔', vocabulary: '📝', story: '📚',
  animation: '🎬', grammar: '📐', reading: '📖', speaking: '🎭',
  game: '🎯', summary: '💡', homework: '✏️',
  knowledge: '📚', example: '📝', practice: '✍️', detail: '🔍',
  discussion: '💬', writing: '🖋️', review: '✅',
};

const compLabels = {
  cover: '封面', warmup: '热身', vocabulary: '词汇', story: '故事',
  animation: '动画', grammar: '语法', reading: '阅读', speaking: '口语',
  game: '闯关', summary: '总结', homework: '作业',
  knowledge: '知识讲解', example: '典型例题', practice: '课堂练习', detail: '精读理解',
  discussion: '讨论', writing: '写作', review: '复习检测',
};

const darkComps = ['story', 'animation', 'speaking', 'game', 'summary'];

const commonAnims = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zoom-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  @keyframes fly-from-bottom { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
  @keyframes sparkle { 0% { transform: scale(0) rotate(0deg); opacity: 0; } 50% { transform: scale(1.2) rotate(180deg); opacity: 1; } 100% { transform: scale(1) rotate(360deg); opacity: 0.8; } }
  @keyframes slide-in-right { from { opacity: 0; transform: translateX(80px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 5px rgba(255,255,255,0.3); } 50% { box-shadow: 0 0 20px rgba(255,255,255,0.6); } }
  .animate-fade { animation: fade-in 0.6s ease-out both; }
  .animate-up { animation: fade-in-up 0.6s ease-out both; }
  .animate-zoom { animation: zoom-in 0.6s ease-out both; }
  .animate-fly { animation: fly-from-bottom 0.5s ease-out both; }
  .animate-slide { animation: slide-in-right 0.5s ease-out both; }
  .animate-bounce { animation: bounce-in 0.6s ease-out both; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; } .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; } .stagger-5 { animation-delay: 0.5s; } .stagger-6 { animation-delay: 0.6s; }
`;

export default function LessonPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizRevealed, setQuizRevealed] = useState(null);

  useEffect(() => {
    if (!id || id === 'new') { navigate('/lessons'); return; }
    getLesson(id).then(setLesson).catch(() => navigate('/lessons')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setQuizAnswer(null);
    setQuizRevealed(null);
  }, [current]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, lesson]);

  const goNext = useCallback(() => { if (!lesson || current >= lesson.slides.length - 1) return; setCurrent(c => c + 1); }, [current, lesson]);
  const goPrev = useCallback(() => { if (current <= 0) return; setCurrent(c => c - 1); }, [current]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900"><Loader2 className="animate-spin text-indigo-400 mx-auto" size={40} /></div>;
  if (!lesson) return null;

  const slide = lesson.slides[current];
  const isDark = darkComps.includes(slide?.component);
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const textMuted = isDark ? 'text-white/60' : 'text-gray-500';

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <style>{commonAnims}</style>

      <div className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/teach" className="text-white/40 hover:text-white/80 transition"><ChevronLeft size={20} /></Link>
          <div>
            <h2 className="font-semibold text-white text-sm">{lesson.title}</h2>
            <p className="text-xs text-white/40">{lesson.slide_count || 0} 页</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/lessons/edit/${id}`)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition"
          ><Edit2 size={14} /> 编辑</button>
          <button onClick={() => document.documentElement.requestFullscreen?.()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition"
          ><Maximize2 size={14} /> 全屏</button>
        </div>
      </div>

      <div className="flex items-center justify-center p-4" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="relative w-full max-w-5xl h-full rounded-2xl overflow-hidden shadow-2xl select-none">
          <RenderSlide slide={slide} isDark={isDark}
            quizAnswer={quizAnswer} setQuizAnswer={setQuizAnswer}
            quizRevealed={quizRevealed} setQuizRevealed={setQuizRevealed}
          />

          <div className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize z-20" onClick={e => { e.stopPropagation(); goPrev(); }} />
          <div className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize z-20" onClick={e => { e.stopPropagation(); goNext(); }} />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {lesson.slides.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>

          <div className="absolute top-4 right-4 z-20">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-white/50' : 'bg-white/60 text-gray-500'}`}>
              {current + 1} / {lesson.slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ count = 20 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 4}s infinite`
          }}
        />
      ))}
    </div>
  );
}

function PatternDots({ color = 'rgba(255,255,255,0.05)' }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
      backgroundSize: '24px 24px'
    }} />
  );
}

function RenderSlide({ slide, isDark, quizAnswer, setQuizAnswer, quizRevealed, setQuizRevealed }) {
  if (!slide) return null;
  const props = { slide, isDark, quizAnswer, setQuizAnswer, quizRevealed, setQuizRevealed };

  switch (slide.component) {
    case 'cover': return <CoverSlide {...props} />;
    case 'warmup': return <WarmupSlide {...props} />;
    case 'vocabulary': return <VocabularySlide {...props} />;
    case 'story': return <StorySlide {...props} />;
    case 'animation': return <AnimationSlide {...props} />;
    case 'grammar': return <GrammarSlide {...props} />;
    case 'reading': return <ReadingSlide {...props} />;
    case 'speaking': return <SpeakingSlide {...props} />;
    case 'game': return <GameSlide {...props} />;
    case 'summary': return <SummarySlide {...props} />;
    case 'homework': return <HomeworkSlide {...props} />;
    default: return <DefaultSlide {...props} />;
  }
}

/* ====== COVER ====== */
function CoverSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <PatternDots color="rgba(255,255,255,0.08)" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12">
        {slide.subtitle && (
          <p className="text-white/60 text-sm tracking-widest uppercase mb-4 animate-up">{slide.subtitle}</p>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-zoom">{slide.title}</h1>
        {slide.narrative && (
          <p className="text-white/80 text-lg max-w-2xl animate-up stagger-1">{slide.narrative}</p>
        )}
        <div className="flex gap-3 mt-8 animate-up stagger-2">
          {slide.content?.filter(Boolean).map((item, i) => (
            <span key={i} className="px-4 py-2 rounded-full bg-white/15 text-white/90 text-sm">{item}</span>
          ))}
        </div>
        {slide.goal && (
          <div className="mt-8 animate-up stagger-3">
            <span className="inline-block px-5 py-2 rounded-full bg-white/20 text-white text-sm backdrop-blur-sm">
              🎯 {slide.goal}
            </span>
          </div>
        )}
        <p className="absolute bottom-8 text-white/30 text-xs animate-up stagger-4">按 ← → 或点击切换页面</p>
      </div>
    </div>
  );
}

/* ====== WARMUP ====== */
function WarmupSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <PatternDots color="rgba(234,88,12,0.04)" />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤔</span>
          <span className="text-sm font-medium text-amber-600 tracking-wider">热身活动</span>
          {slide.emotion && <span className="text-xs text-amber-400">{emojiMap[slide.emotion]} {slide.emotion}</span>}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6 animate-up">{slide.title}</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-3xl w-full space-y-4">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm border border-amber-100 animate-fly stagger-${i + 1}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-400 text-white' : 'bg-orange-400 text-white'}`}>
                  {i + 1}
                </div>
                <p className="text-amber-900 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
        {slide.narrative && (
          <p className="text-amber-700/70 text-sm mt-4 italic border-l-2 border-amber-300 pl-4 animate-up">{slide.narrative}</p>
        )}
        {slide.goal && <div className="mt-3 text-center"><span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs">🎯 {slide.goal}</span></div>}
      </div>
    </div>
  );
}

/* ====== VOCABULARY ====== */
function VocabularySlide({ slide, isDark }) {
  const items = slide.content?.filter(Boolean) || [];
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <PatternDots color="rgba(16,185,129,0.04)" />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium text-emerald-600 tracking-wider">词汇学习</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-8 animate-up">{slide.title}</h2>
        <div className="flex-1 grid grid-cols-2 gap-4 content-start max-w-3xl mx-auto w-full">
          {items.map((item, i) => (
            <div key={i} className={`p-5 rounded-xl bg-white shadow-sm border border-emerald-100 animate-fly stagger-${i + 1} hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">{i + 1}</span>
                <span className="font-semibold text-emerald-800">{item.split(':')[0] || item}</span>
              </div>
              {item.includes(':') && <p className="text-emerald-600/70 text-sm ml-8">{item.split(':').slice(1).join(':')}</p>}
            </div>
          ))}
        </div>
        {slide.narrative && (
          <p className="text-emerald-700/60 text-sm mt-4 text-center animate-up">{slide.narrative}</p>
        )}
      </div>
    </div>
  );
}

/* ====== STORY ====== */
function StorySlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      <Stars count={25} />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📚</span>
          <span className="text-sm font-medium text-indigo-300 tracking-wider">故事时间</span>
          {slide.story_part && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300">第 {slide.story_part} 部分</span>}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-up">{slide.title}</h2>
        {slide.narrative && (
          <p className="text-white/70 text-lg leading-relaxed mb-6 max-w-3xl animate-up stagger-1">{slide.narrative}</p>
        )}
        <div className="flex-1 grid gap-3 content-center max-w-3xl mx-auto w-full">
          {slide.content?.filter(Boolean).map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 animate-fly stagger-${i + 2}`}>
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-white/80">{item}</span>
            </div>
          ))}
        </div>
        {slide.goal && <div className="mt-4 text-center"><span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/50 text-xs">🎯 {slide.goal}</span></div>}
      </div>
    </div>
  );
}

/* ====== ANIMATION ====== */
function AnimationSlide({ slide, isDark }) {
  const sceneColors = { kindness: 'from-pink-600 to-rose-900', courage: 'from-amber-700 to-orange-900', default: 'from-teal-700 to-emerald-900' };
  const sceneColor = sceneColors[slide.scene_type] || sceneColors.default;
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${sceneColor}`}>
      <Stars count={15} />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎬</span>
          <span className="text-sm font-medium text-white/60 tracking-wider">情景动画</span>
          {slide.scene_type && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{slide.scene_type === 'kindness' ? '❤️ 善良' : '💪 勇气'}</span>}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-up">{slide.title}</h2>
        {slide.narrative && (
          <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-3xl animate-up stagger-1">{slide.narrative}</p>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-3xl w-full space-y-3">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className={`p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 animate-fly stagger-${i + 2}`}>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== GRAMMAR ====== */
function GrammarSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <PatternDots color="rgba(59,130,246,0.04)" />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📐</span>
          <span className="text-sm font-medium text-blue-600 tracking-wider">语法学习</span>
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-8 animate-up">{slide.title}</h2>
        <div className="flex-1 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-100 animate-slide">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">!</span> 规则</h3>
            <div className="space-y-2">
              {slide.content?.filter(Boolean).slice(0, Math.ceil(slide.content.length / 2)).map((item, i) => (
                <p key={i} className="text-blue-700 text-sm">{item}</p>
              ))}
            </div>
          </div>
          <div className="bg-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200 animate-slide stagger-1">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">★</span> 示例</h3>
            <div className="space-y-2">
              {slide.content?.filter(Boolean).slice(Math.ceil(slide.content.length / 2)).map((item, i) => (
                <p key={i} className="text-blue-700 text-sm">{item}</p>
              ))}
            </div>
          </div>
        </div>
        {slide.narrative && (
          <p className="text-blue-600/60 text-sm mt-4 text-center animate-up">{slide.narrative}</p>
        )}
        {slide.goal && <div className="mt-3 text-center"><span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">🎯 {slide.goal}</span></div>}
      </div>
    </div>
  );
}

/* ====== READING ====== */
function ReadingSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-yellow-50 to-amber-50">
      <PatternDots color="rgba(120,53,15,0.04)" />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📖</span>
          <span className="text-sm font-medium text-amber-700 tracking-wider">阅读写作</span>
        </div>
        <h2 className="text-3xl font-bold text-amber-900 mb-6 animate-up">{slide.title}</h2>
        <div className="flex-1 max-w-4xl mx-auto w-full bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-amber-100 animate-zoom">
          <div className="space-y-4">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className={`flex items-start gap-3 text-amber-900 animate-fly stagger-${i + 1}`}>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
        {slide.narrative && (
          <p className="text-amber-700/60 text-sm mt-4 text-center animate-up">{slide.narrative}</p>
        )}
        {slide.goal && <div className="mt-3 text-center"><span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs">🎯 {slide.goal}</span></div>}
      </div>
    </div>
  );
}

/* ====== SPEAKING / ROLE PLAY ====== */
function SpeakingSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
      <Stars count={12} />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎭</span>
          <span className="text-sm font-medium text-purple-300 tracking-wider">角色扮演</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-6 animate-up">{slide.title}</h2>
        {slide.narrative && (
          <p className="text-white/70 text-lg leading-relaxed mb-6 max-w-3xl animate-up stagger-1">{slide.narrative}</p>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-4">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className={`p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 animate-fly stagger-${i + 1} hover:bg-white/15 transition-colors`}>
                <div className="text-3xl mb-2">{['🎭', '🎪', '🎬', '🎤'][i % 4]}</div>
                <p className="text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== GAME / QUIZ ====== */
function GameSlide({ slide, isDark, quizAnswer, setQuizAnswer, quizRevealed, setQuizRevealed }) {
  const questions = slide.quiz?.questions || [];
  const [qIndex, setQIndex] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <Stars count={20} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-bold text-white mb-4">{slide.title}</h2>
          <div className="space-y-3 max-w-xl w-full">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className="p-4 bg-white/10 rounded-xl text-white/80 text-center animate-bounce">{item}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  if (!q) return null;

  const handleAnswer = (idx) => {
    if (quizRevealed !== null) return;
    setQuizAnswer(idx);
    setQuizRevealed(idx);
  };

  const isCorrect = quizRevealed !== null && quizAnswer === q.answer;
  const isWrong = quizRevealed !== null && quizAnswer !== q.answer;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <Stars count={20} />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium text-indigo-300 tracking-wider">知识闯关</span>
            <span className="text-xs text-indigo-400/60 ml-2">{qIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i <= qIndex ? 'bg-indigo-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div className={`w-full p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-6 animate-zoom`}>
            <p className="text-white text-xl font-medium">{q.question}</p>
          </div>

          <div className="w-full space-y-3">
            {q.options?.map((opt, idx) => {
              let btnClass = 'bg-white/10 hover:bg-white/20 border-white/20';
              if (quizRevealed !== null && idx === q.answer) btnClass = 'bg-emerald-500/30 border-emerald-400';
              else if (quizRevealed !== null && idx === quizAnswer && idx !== q.answer) btnClass = 'bg-red-500/30 border-red-400';
              return (
                <button key={idx} onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 rounded-xl border backdrop-blur-sm text-white text-left flex items-center gap-3 transition-all animate-slide stagger-${idx + 1} ${btnClass}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${quizRevealed !== null && idx === q.answer ? 'bg-emerald-500 text-white' : quizRevealed !== null && idx === quizAnswer && idx !== q.answer ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                  {quizRevealed !== null && idx === q.answer && <span className="ml-auto text-emerald-400">✓</span>}
                  {quizRevealed !== null && idx === quizAnswer && idx !== q.answer && <span className="ml-auto text-red-400">✗</span>}
                </button>
              );
            })}
          </div>

          {quizRevealed !== null && q.explanation && (
            <div className={`mt-4 p-4 rounded-xl w-full animate-up ${isCorrect ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-amber-500/20 border border-amber-400/30'}`}>
              <p className={`text-sm ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isCorrect ? '✓ 回答正确！' : '✗ 正确答案是 ' + q.options[q.answer]}
              </p>
              {q.explanation && <p className="text-white/60 text-xs mt-1">{q.explanation}</p>}
            </div>
          )}
        </div>

        {quizRevealed !== null && qIndex < questions.length - 1 && (
          <div className="text-center mt-4">
            <button onClick={() => { setQIndex(i => i + 1); setQuizAnswer(null); setQuizRevealed(null); }}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full text-sm transition"
            >下一题 <ChevronRight size={14} className="inline" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== SUMMARY ====== */
function SummarySlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      <Stars count={25} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 md:p-14">
        <span className="text-4xl mb-4 animate-bounce">💡</span>
        <h2 className="text-3xl font-bold text-white mb-8 animate-up">{slide.title}</h2>
        <div className="max-w-2xl w-full space-y-3">
          {slide.content?.filter(Boolean).map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 animate-fly stagger-${i + 1}`}>
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white text-sm flex items-center justify-center flex-shrink-0">★</span>
              <span className="text-white/80">{item}</span>
            </div>
          ))}
        </div>
        {slide.goal && (
          <div className="mt-8 animate-up stagger-3">
            <span className="inline-block px-5 py-2 rounded-full bg-white/10 text-white/60 text-sm backdrop-blur-sm">🎯 {slide.goal}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== HOMEWORK ====== */
function HomeworkSlide({ slide, isDark }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <PatternDots color="rgba(244,63,94,0.04)" />
      <div className="relative z-10 h-full flex flex-col p-10 md:p-14">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✏️</span>
          <span className="text-sm font-medium text-rose-600 tracking-wider">课后作业</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-8 text-center animate-up">{slide.title}</h2>
          <div className="max-w-2xl w-full space-y-4">
            {slide.content?.filter(Boolean).map((item, i) => (
              <div key={i} className={`p-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-rose-100 animate-fly stagger-${i + 1}`}>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-rose-800">{item}</p>
                </div>
              </div>
            ))}
          </div>
          {slide.narrative && (
            <p className="text-rose-600/60 text-sm mt-6 text-center animate-up">{slide.narrative}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====== DEFAULT FALLBACK ====== */
function DefaultSlide({ slide, isDark }) {
  const bg = isDark ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white';
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${bg}`}>
      {isDark && <Stars count={10} />}
      {!isDark && <PatternDots color="rgba(0,0,0,0.03)" />}
      <div className="relative z-10 h-full flex flex-col p-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{compEmoji[slide.component] || '📄'}</span>
          <span className={`text-sm font-medium tracking-wider ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            {compLabels[slide.component] || slide.component}
          </span>
          {slide.emotion && <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{emojiMap[slide.emotion]} {slide.emotion}</span>}
        </div>
        <h2 className={`text-3xl font-bold mb-6 ${textColor} animate-up`}>{slide.title}</h2>
        {slide.narrative && (
          <p className={`text-lg leading-relaxed mb-6 max-w-3xl ${textMuted} animate-up stagger-1`}>
            {slide.narrative}
          </p>
        )}
        <div className="flex-1 grid gap-3 content-center max-w-2xl mx-auto w-full">
          {slide.content?.filter(Boolean).map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl animate-fly stagger-${i + 1} ${isDark ? 'bg-white/10' : 'bg-white/60 border border-gray-100'}`}>
              <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: i % 2 === 0 ? '#F4A261' : '#2A9D8F' }}>{i + 1}</span>
              <span className={isDark ? 'text-white/80' : 'text-gray-700'}>{item}</span>
            </div>
          ))}
        </div>
        {slide.goal && (
          <div className="mt-4 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs ${isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
              🎯 {slide.goal}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
