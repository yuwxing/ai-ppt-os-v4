import { SlideData } from './types'

export default function SummarySlide({ slide }: { slide: SlideData }) {
  const keyPoints = [
    { icon: '🤝', en: 'help', zh: '帮助别人', color: '#2A9D8F' },
    { icon: '💪', en: 'brave', zh: '勇敢面对', color: '#E76F51' },
    { icon: '⭐', en: 'believe', zh: '相信自己', color: '#F4A261' },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #0D0D2B 0%, #1A1A4E 50%, #2D1B69 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 大星星背景 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,5 63,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 37,35"
              fill="#FFD700" />
          </svg>
        </div>
      </div>

      {/* 浮动星星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i}
            className="absolute text-[#FFD700] animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.3,
              fontSize: `${10 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          >✦</div>
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {slide.title}
        </h2>

        {/* 关键词三大支柱 */}
        <div className="flex gap-8 mb-10">
          {keyPoints.map((point, i) => (
            <div key={i}
              className="flex flex-col items-center animate-zoom-in"
              style={{ animationDelay: `${0.6 + i * 0.3}s` }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-3 shadow-lg"
                style={{ backgroundColor: point.color + '20', border: `2px solid ${point.color}40` }}
              >
                {point.icon}
              </div>
              <p className="text-white font-bold text-lg">{point.en}</p>
              <p className="text-white/60 text-sm">{point.zh}</p>
            </div>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent mb-6 animate-fade-in"
          style={{ animationDelay: '1.5s' }} />

        {/* 金句 */}
        <div className="animate-zoom-in" style={{ animationDelay: '1.8s' }}>
          <p className="text-2xl text-[#FFD700] font-bold mb-2">You are a star!</p>
          <p className="text-white/50 text-sm">每个人都是最亮的星 ✦</p>
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 animate-fade-in"
          style={{ animationDelay: '2.5s' }}
        >
          {['帮助别人', '勇敢面对', '相信自己'].map((text) => (
            <span key={text}
              className="px-3 py-1 bg-white/10 rounded-full text-white/50 text-xs"
            >
              #{text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
