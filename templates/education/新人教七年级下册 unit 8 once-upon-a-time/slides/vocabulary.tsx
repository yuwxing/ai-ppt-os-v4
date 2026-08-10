import { SlideData } from './types'

export default function VocabularySlide({ slide }: { slide: SlideData }) {
  const cards = [
    { icon: '🌅', phrase: 'wake up', past: 'woke up', meaning: '醒来', action: '伸懒腰' },
    { icon: '⬆️', phrase: 'get up', past: 'got up', meaning: '起床', action: '跳起来' },
    { icon: '🪥', phrase: 'brush teeth', past: 'brushed teeth', meaning: '刷牙', action: '刷刷刷' },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #FFF3E0 0%, #FFE8C8 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 早晨阳光 */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
        <div className="w-full h-full rounded-full bg-[#F4A261] blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col p-10">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <p className="text-sm text-[#E76F51] tracking-wider mb-1">✦ 词 汇 学 习 ✦</p>
          <h2 className="text-3xl font-bold text-[#264653]">{slide.title}</h2>
        </div>

        {/* 场景描述 */}
        <p className="text-center text-[#264653]/70 mb-6 max-w-xl mx-auto">
          {slide.narrative}
        </p>

        {/* 词汇卡片 */}
        <div className="flex gap-6 justify-center flex-1 items-center">
          {cards.map((card, i) => (
            <div key={i}
              className="group relative w-56 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer
                hover:shadow-xl transition-all duration-300 hover:-translate-y-2
                animate-fly-from-bottom"
              style={{ animationDelay: `${0.6 + i * 0.3}s` }}
            >
              {/* 卡片顶部图标 */}
              <div className="bg-[#F4A261]/20 p-4 text-center">
                <span className="text-4xl">{card.icon}</span>
              </div>

              {/* 卡片内容 */}
              <div className="p-5 text-center">
                <p className="text-xl font-bold text-[#264653]">{card.phrase}</p>
                <p className="text-sm text-[#2A9D8F] font-medium mt-1">
                  past: <span className="text-[#E76F51]">{card.past}</span>
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="px-3 py-1 bg-[#FFF3E0] rounded-full text-xs text-[#264653]">
                    {card.meaning}
                  </span>
                  <span className="px-3 py-1 bg-[#E8F5E9] rounded-full text-xs text-[#2A9D8F]">
                    🎭 {card.action}
                  </span>
                </div>
              </div>

              {/* 翻转提示 */}
              <div className="absolute inset-0 bg-[#264653] rounded-2xl flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-center p-4">
                  <p className="text-lg font-bold mb-2">She {card.past}.</p>
                  <p className="text-sm text-white/70">她{card.meaning === '醒来' ? '醒了' : card.meaning === '起床' ? '起床了' : '刷牙了'}。</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 跟读提示 */}
        <div className="mt-6 p-4 bg-white/60 rounded-xl text-center">
          <p className="text-[#E76F51] font-medium animate-pulse">
            🎤 跟我读：边读边做动作！She wakes up. She gets up. She brushes her teeth.
          </p>
        </div>
      </div>
    </div>
  )
}
