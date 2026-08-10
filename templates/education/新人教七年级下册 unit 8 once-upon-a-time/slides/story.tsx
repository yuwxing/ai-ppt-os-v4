import { useState } from 'react'
import { SlideData } from './types'

export default function StorySlide({ slide }: { slide: SlideData }) {
  const [noteRevealed, setNoteRevealed] = useState(false)
  const isPart2 = slide.story_part === 2

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: isPart2
          ? 'linear-gradient(135deg, #1A3A40 0%, #264653 50%, #2A5A6A 100%)'
          : 'linear-gradient(135deg, #2D1B0E 0%, #4A3728 50%, #5D4E37 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 星光粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col p-10">
        {/* 标题 */}
        <div className="mb-6">
          <p className="text-sm text-[#F4A261]/80 tracking-wider mb-1">
            ✦ {isPart2 ? '秘 密 揭 晓' : '故 事 转 折'} ✦
          </p>
          <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
        </div>

        {/* 故事内容 */}
        <div className="flex-1 flex gap-8 items-center">
          {/* 左侧场景 */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="relative">
              {/* 发光瓶子或纸条 */}
              {isPart2 ? (
                <div className="relative cursor-pointer" onClick={() => setNoteRevealed(true)}>
                  {/* 瓶子 */}
                  {!noteRevealed ? (
                    <div className="w-40 h-56 relative animate-float">
                      <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_0_30px_rgba(244,162,97,0.5)]">
                        <defs>
                          <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F4A261" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#E76F51" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                        <rect x="35" y="20" width="30" height="15" rx="5" fill="#F4A261" opacity="0.5" />
                        <path d="M25 35 L20 110 Q20 125 35 125 L65 125 Q80 125 80 110 L75 35 Z"
                          fill="url(#bottleGrad)" stroke="#F4A261" strokeWidth="1" />
                        <circle cx="50" cy="80" r="12" fill="#FFD700" opacity="0.6" className="animate-pulse" />
                        <text x="50" y="84" textAnchor="middle" fontSize="10" fill="#FFD700">✨</text>
                      </svg>
                      <p className="text-center mt-2 text-[#F4A261]/60 text-sm">点击打开</p>
                    </div>
                  ) : (
                    /* 纸条 */
                    <div className="w-48 p-6 bg-[#FFF8F0] rounded-lg shadow-2xl animate-zoom-in rotate-2">
                      <p className="text-center text-[#264653] font-bold text-lg mb-3">
                        🌟 任务 🌟
                      </p>
                      <p className="text-center text-[#264653]">
                        "找到三颗星星，<br />才能回家"
                      </p>
                      <div className="mt-3 text-center text-[#E76F51] text-sm">
                        find the stars ✦ ✦ ✦
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 迷路场景 */
                <div className="relative w-64 h-64 animate-zoom-in">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* 树木剪影 */}
                    {[30, 70, 120, 160, 180].map((x, i) => (
                      <g key={i}>
                        <rect x={x - 3} y={80 - i * 5} width="6" height={80 + i * 5}
                          fill="#1A1A1A" opacity={0.5 - i * 0.05} />
                        <circle cx={x} cy={75 - i * 5} r={12 + i * 2}
                          fill="#1A1A1A" opacity={0.3 - i * 0.02} />
                      </g>
                    ))}
                    {/* 月亮 */}
                    <circle cx="160" cy="40" r="20" fill="#F4A261" opacity="0.6" />
                    {/* 发光瓶子 */}
                    <circle cx="100" cy="130" r="8" fill="#FFD700" opacity="0.8"
                      className="animate-pulse" />
                    <text x="100" y="134" textAnchor="middle" fontSize="8" fill="#FFD700">✨</text>
                    {/* 小路 */}
                    <path d="M50 200 Q60 170 80 160 Q100 150 100 130"
                      fill="none" stroke="#5D4E37" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-[#F4A261]/60 text-xs">🌲 森林深处</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧文本 */}
          <div className="w-1/2 space-y-4">
            <p className="text-white/90 text-lg leading-relaxed">
              {slide.narrative}
            </p>

            <div className="space-y-2">
              {slide.content.map((item, i) => (
                <div key={i}
                  className="flex items-start gap-2 text-white/70 animate-fade-in"
                  style={{ animationDelay: `${0.5 + i * 0.2}s` }}
                >
                  <span className="text-[#F4A261] text-xs mt-1">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* 词汇高亮 */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['bottle', 'note', 'star', 'find', 'afraid'].slice(0, isPart2 ? 3 : 3).map((word) => (
                <span key={word}
                  className="px-3 py-1 bg-[#F4A261]/20 border border-[#F4A261]/30 rounded-full
                    text-[#F4A261] text-sm font-medium animate-pulse"
                >
                  {word}
                </span>
              ))}
            </div>

            {/* 互动问题 */}
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-[#F4A261] text-sm">
                💭 {isPart2 ? '星星在哪里？帮 Lily 找找线索！' : '如果你是她，你会怎么做？'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
