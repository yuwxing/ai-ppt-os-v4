import { useState } from 'react'
import { SlideData } from './types'

export default function AnimationSlide({ slide }: { slide: SlideData }) {
  const [scene, setScene] = useState<'intro' | 'main' | 'star'>('intro')
  const isCourage = slide.scene_type === 'courage'

  const scenes = isCourage ? {
    bg: 'from-[#1A1A2E] via-[#2D1B0E] to-[#1A1A2E]',
    titleColor: '#E76F51',
    accentColor: '#FFD700',
    items: [
      { icon: '🏔️', text: '黑暗的山洞' },
      { icon: '😰', text: '小腿在发抖' },
      { icon: '💪', text: '握紧拳头' },
      { icon: '✨', text: '发现星星！' },
    ],
    quote: '"勇敢不是不害怕，而是害怕时还要前进。"',
    vocab: ['cave', 'dark', 'brave']
  } : {
    bg: 'from-[#1A3A1A] via-[#2D5A2D] to-[#1A3A1A]',
    titleColor: '#2A9D8F',
    accentColor: '#FFD700',
    items: [
      { icon: '🐦', text: '受伤的小鸟' },
      { icon: '🩹', text: '用树叶包扎' },
      { icon: '❤️', text: '善良的心' },
      { icon: '✨', text: '第一颗星亮了' },
    ],
    quote: '"你有一颗善良的心，这颗星星送给你。"',
    vocab: ['help', 'hurt', 'friend']
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br ${scenes.bg}`}
      style={{ fontFamily: "'Microsoft YaHei', sans-serif" }}
    >
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col p-10">
        {/* 标题 */}
        <div className="text-center mb-6">
          <p className="text-sm tracking-wider mb-1" style={{ color: scenes.titleColor }}>
            ✦ {isCourage ? '勇 敢 的 力 量' : '善 良 的 温 暖'} ✦
          </p>
          <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
        </div>

        {/* 场景控制 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* 场景展示 */}
          <div className="relative w-64 h-48" onClick={() => {
            if (scene === 'intro') setScene('main')
            else if (scene === 'main') setScene('star')
          }}>
            {scene === 'intro' && (
              <div className="w-full h-full flex items-center justify-center animate-fade-in cursor-pointer">
                <div className="text-center">
                  <p className="text-6xl mb-4">{isCourage ? '🏔️' : '🐦'}</p>
                  <p className="text-white/60 text-sm">点击进入场景</p>
                </div>
              </div>
            )}
            {scene === 'main' && (
              <div className="w-full h-full flex items-center justify-center animate-zoom-in">
                <svg viewBox="0 0 200 160" className="w-full h-full">
                  {isCourage ? (
                    /* 山洞场景 */
                    <>
                      <path d="M20 20 Q100 0 180 20 L180 160 L20 160 Z" fill="#2D1B0E" opacity="0.8" />
                      <ellipse cx="100" cy="60" rx="60" ry="40" fill="#1A1A1A" />
                      <ellipse cx="100" cy="55" rx="45" ry="25" fill="#2D1B0E" />
                      <text x="100" y="130" textAnchor="middle" fontSize="12" fill="#F4A261" opacity="0.8">
                        🌟 cave · dark · brave
                      </text>
                    </>
                  ) : (
                    /* 帮助小鸟场景 */
                    <>
                      <circle cx="100" cy="80" r="50" fill="#2D5A2D" opacity="0.5" />
                      <text x="100" y="70" textAnchor="middle" fontSize="30">🐰</text>
                      <text x="100" y="110" textAnchor="middle" fontSize="20">🐦</text>
                      <text x="100" y="145" textAnchor="middle" fontSize="12" fill="#2A9D8F" opacity="0.8">
                        ❤️ help · hurt · friend
                      </text>
                    </>
                  )}
                </svg>
              </div>
            )}
            {scene === 'star' && (
              <div className="w-full h-full flex items-center justify-center animate-zoom-in">
                <div className="text-center">
                  <div className="text-7xl mb-2 animate-sparkle">⭐</div>
                  <p className="text-[#FFD700] text-xl font-bold animate-pulse">
                    {isCourage ? '第二颗星 ✦' : '第一颗星 ✦'}
                  </p>
                  <p className="text-white/60 text-sm mt-2">点击重新播放</p>
                </div>
              </div>
            )}
          </div>

          {/* 故事线索 */}
          <div className="flex gap-4">
            {scenes.items.map((item, i) => (
              <div key={i}
                className={`px-4 py-2 bg-white/10 rounded-xl text-center transition-all duration-500
                  ${scene === 'intro' && i === 0 ? 'opacity-100' : ''}
                  ${scene === 'main' && i <= scene.indexOf(scene) ? 'animate-fade-in' : ''}
                  ${scene === 'star' ? 'opacity-100' : ''}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-white/80 text-xs">{item.text}</div>
              </div>
            ))}
          </div>

          {/* 引用 */}
          <div className="max-w-lg text-center">
            <p className="text-white/60 italic text-sm">{scenes.quote}</p>
          </div>

          {/* 词汇 */}
          <div className="flex gap-3">
            {scenes.vocab.map((word) => (
              <span key={word}
                className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white font-medium text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-center gap-3 mt-4">
          {['intro', 'main', 'star'].map((s) => (
            <button key={s}
              onClick={() => setScene(s as any)}
              className={`w-3 h-3 rounded-full transition-all ${scene === s ? 'bg-[#FFD700] scale-125' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
