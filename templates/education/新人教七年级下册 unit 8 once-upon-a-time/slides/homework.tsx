import { SlideData } from './types'

export default function HomeworkSlide({ slide }: { slide: SlideData }) {
  const framework = [
    { label: '时间', hint: 'When?', icon: '⏰' },
    { label: '地点', hint: 'Where?', icon: '📍' },
    { label: '角色', hint: 'Who?', icon: '👤' },
    { label: '事件', hint: 'What?', icon: '📖' },
  ]

  const tipWords = ['adventure', 'friend', 'magic', 'forest', 'star', 'brave']

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE8C8 50%, #F5E6CC 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      <div className="h-full flex p-10 gap-8">
        {/* 左侧空白故事书 */}
        <div className="w-1/2 flex flex-col justify-center">
          <div className="relative">
            {/* 故事书封面 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#F4A261]/30 transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFF3E0] rounded-full flex items-center justify-center">
                  <span className="text-3xl">📖</span>
                </div>
                <p className="text-[#264653] font-bold text-lg mb-2">我的故事续集</p>
                <p className="text-[#264653]/50 text-sm">My Story Continuation</p>
                <div className="mt-4 border-t border-dashed border-[#F4A261]/30 pt-4">
                  <p className="text-[#264653]/40 text-xs">_________ の冒险</p>
                </div>
                {/* 装饰贴纸 */}
                <div className="absolute top-2 right-2 opacity-30 text-sm">⭐ 🐾 ✨</div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-[#F4A261]/10 rounded-2xl -z-10" />
          </div>
        </div>

        {/* 右侧作业内容 */}
        <div className="w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-sm text-[#E76F51] tracking-wider mb-1">✦ 课 后 拓 展 ✦</p>
            <h2 className="text-3xl font-bold text-[#264653]">{slide.title}</h2>
            <p className="text-[#264653]/70 mt-2">{slide.narrative}</p>
          </div>

          {/* 续写框架 */}
          <div className="bg-white/80 rounded-xl p-4 mb-4">
            <p className="text-[#264653] font-medium mb-3">📝 续写框架</p>
            <div className="grid grid-cols-2 gap-2">
              {framework.map((item, i) => (
                <div key={i}
                  className="flex items-center gap-2 p-2 bg-[#FFF3E0] rounded-lg animate-fly-from-bottom"
                  style={{ animationDelay: `${0.5 + i * 0.15}s` }}
                >
                  <span>{item.icon}</span>
                  <div>
                    <p className="text-[#264653] text-sm font-medium">{item.label}</p>
                    <p className="text-[#264653]/40 text-xs">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 提示词汇 */}
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-[#264653] text-sm font-medium mb-2">💡 用到这些词：</p>
            <div className="flex flex-wrap gap-2">
              {tipWords.map((word, i) => (
                <span key={i}
                  className="px-3 py-1 bg-white border border-[#F4A261]/30 rounded-full text-sm text-[#264653]
                    hover:bg-[#F4A261]/10 transition-colors cursor-pointer"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* 分享提示 */}
          <div className="mt-4 p-3 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
            <p className="text-[#2A9D8F] text-sm">
              📢 下节课分享优秀作品，期待你的创意！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
