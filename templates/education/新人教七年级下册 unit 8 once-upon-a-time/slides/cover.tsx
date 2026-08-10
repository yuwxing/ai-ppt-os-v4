import { SlideData } from './types'

export default function CoverSlide({ slide }: { slide: SlideData }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE8C8 50%, #FFDDB5 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 装饰星星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i}
            className="absolute text-2xl animate-pulse"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              opacity: 0.3 + Math.random() * 0.4,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${12 + Math.random() * 20}px`
            }}
          >✦</div>
        ))}
      </div>

      {/* 故事书装饰 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 opacity-10">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <path d="M50 280 L50 60 Q50 20 90 20 L350 20 Q390 20 390 60 L390 280 Z"
            fill="none" stroke="#8B5E3C" strokeWidth="2" />
          <line x1="200" y1="20" x2="200" y2="280" stroke="#8B5E3C" strokeWidth="1" />
          <path d="M50 280 Q125 260 200 280 Q275 260 350 280"
            fill="none" stroke="#8B5E3C" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center">
        {/* 装饰边框 */}
        <div className="absolute inset-4 border-2 border-[#F4A261]/30 rounded-xl" />

        <p className="text-sm tracking-widest text-[#E76F51] mb-2 animate-fade-in"
          style={{ fontFamily: "'Segoe UI', sans-serif", animationDelay: '0.5s' }}
        >
          ✦ 新 人 教 版 七 年 级 英 语 下 册 ✦
        </p>

        <h1 className="text-5xl font-bold text-[#264653] mt-2 animate-zoom-in"
          style={{ animationDelay: '0.8s', fontFamily: "'Comic Sans MS', cursive" }}
        >
          Once upon a Time
        </h1>

        <div className="w-24 h-1 bg-[#F4A261] my-4 rounded-full animate-fade-in"
          style={{ animationDelay: '1.2s' }} />

        <h2 className="text-3xl text-[#2A9D8F] font-bold animate-fade-in-up"
          style={{ animationDelay: '1.2s' }}
        >
          故事之门：从前有座山
        </h2>

        <p className="mt-4 text-lg text-[#264653]/70 max-w-lg animate-fade-in"
          style={{ animationDelay: '1.6s' }}
        >
          Unit 8 — 阅读课
        </p>

        <div className="mt-6 flex gap-3 animate-fade-in"
          style={{ animationDelay: '2s' }}
        >
          <span className="px-4 py-1.5 bg-[#F4A261] text-white rounded-full text-sm">
            🎯 故事理解
          </span>
          <span className="px-4 py-1.5 bg-[#2A9D8F] text-white rounded-full text-sm">
            📖 过去式
          </span>
          <span className="px-4 py-1.5 bg-[#E76F51] text-white rounded-full text-sm">
            ✍️ 创意写作
          </span>
        </div>
      </div>
    </div>
  )
}
