import { SlideData } from './types'

export default function WarmupSlide({ slide }: { slide: SlideData }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8C8 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      <div className="flex h-full">
        {/* 左侧地图区域 */}
        <div className="w-1/2 relative bg-[#FEF3E2] flex items-center justify-center p-8">
          <div className="relative w-full max-w-sm aspect-square">
            {/* 手绘地图 SVG */}
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* 草地 */}
              <ellipse cx="150" cy="220" rx="140" ry="80" fill="#D4E9D6" opacity="0.6" />
              {/* 河流 */}
              <path d="M0 180 Q75 120 150 180 Q225 240 300 180"
                fill="none" stroke="#7EC8E3" strokeWidth="3" strokeDasharray="6,3" />
              {/* 森林 */}
              <circle cx="80" cy="160" r="30" fill="#2A9D8F" opacity="0.4" />
              <circle cx="100" cy="140" r="20" fill="#2A9D8F" opacity="0.3" />
              <circle cx="60" cy="140" r="25" fill="#2A9D8F" opacity="0.35" />
              {/* 小屋 */}
              <rect x="190" y="140" width="30" height="25" rx="2" fill="#E76F51" opacity="0.7" />
              <polygon points="195,140 205,125 215,140" fill="#C0392B" opacity="0.7" />
              {/* 山洞 */}
              <ellipse cx="230" cy="190" rx="20" ry="15" fill="#5D4E37" opacity="0.5" />
              {/* 小路 */}
              <path d="M205 165 Q180 180 150 190 Q120 200 100 180 Q80 160 80 140"
                fill="none" stroke="#C9A96E" strokeWidth="2" strokeDasharray="4,3" />
              {/* 起点标记 */}
              <circle cx="205" cy="155" r="5" fill="#E76F51" />
              <text x="215" y="150" fontSize="8" fill="#E76F51">起点</text>
              {/* Lily 角色 */}
              <circle cx="170" cy="180" r="6" fill="#F4A261" />
              <text x="175" y="175" fontSize="7" fill="#F4A261">🐰</text>
              {/* 图例 */}
              <rect x="10" y="260" width="280" height="30" rx="4" fill="white" opacity="0.7" />
              <text x="20" y="280" fontSize="8" fill="#666">
                🌲 森林 &nbsp; 🏠 小屋 &nbsp; 🏔️ 山洞 &nbsp; ~~~~ 小河 &nbsp; - - 小路
              </text>
            </svg>
            {/* 浮动标注 */}
            <div className="absolute top-4 right-2 bg-white/80 rounded-lg px-2 py-1 text-xs text-[#2A9D8F] shadow-sm animate-float">
              🎯 故事发生地
            </div>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="w-1/2 flex flex-col justify-center p-10">
          <h2 className="text-3xl font-bold text-[#264653] mb-4">
            {slide.title}
          </h2>

          <p className="text-lg text-[#264653]/80 mb-6 leading-relaxed">
            {slide.narrative}
          </p>

          <div className="space-y-3">
            {slide.content.map((item, i) => (
              <div key={i}
                className="flex items-start gap-3 p-3 bg-white/60 rounded-xl animate-fly-from-bottom"
                style={{ animationDelay: `${0.6 + i * 0.25}s` }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F4A261] text-white text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[#264653]">{item}</span>
              </div>
            ))}
          </div>

          {/* 提示 */}
          <div className="mt-6 p-3 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
            <div className="flex items-center gap-2 text-[#2A9D8F] text-sm font-medium">
              <span>💡</span>
              <span>猜猜 Lily 会去哪里？穿过森林还是沿着小河走？</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
