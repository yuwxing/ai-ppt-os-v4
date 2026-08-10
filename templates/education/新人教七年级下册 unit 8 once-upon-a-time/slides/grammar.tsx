import { useState } from 'react'
import { SlideData } from './types'

export default function GrammarSlide({ slide }: { slide: SlideData }) {
  const [activeTab, setActiveTab] = useState<'rule' | 'examples'>('rule')

  const pastTensePairs = [
    { present: 'walk', past: 'walked', icon: '🚶' },
    { present: 'help', past: 'helped', icon: '🤝' },
    { present: 'brush', past: 'brushed', icon: '🪥' },
    { present: 'find', past: 'found', icon: '🔍' },
    { present: 'wake', past: 'woke', icon: '🌅' },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #F0F7F4 0%, #E8F5E9 50%, #F1F8E9 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 装饰脚印 */}
      <div className="absolute top-4 left-4 text-2xl opacity-20 rotate-45">👣</div>
      <div className="absolute top-12 left-16 text-xl opacity-15 rotate-30">👣</div>
      <div className="absolute bottom-8 right-12 text-2xl opacity-20 -rotate-20">👣</div>

      <div className="relative z-10 h-full flex flex-col p-10">
        {/* 标题 */}
        <div className="text-center mb-6">
          <p className="text-sm text-[#2A9D8F] tracking-wider mb-1">✦ 语 法 小 站 ✦</p>
          <h2 className="text-3xl font-bold text-[#264653]">{slide.title}</h2>
        </div>

        <p className="text-center text-[#264653]/70 mb-6 max-w-lg mx-auto">
          {slide.narrative}
        </p>

        {/* Tab 切换 */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('rule')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'rule'
                ? 'bg-[#2A9D8F] text-white shadow-lg'
                : 'bg-white/60 text-[#264653] hover:bg-white'}`}
          >
            📖 规则
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'examples'
                ? 'bg-[#2A9D8F] text-white shadow-lg'
                : 'bg-white/60 text-[#264653] hover:bg-white'}`}
          >
            📝 举例
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex items-center justify-center">
          {activeTab === 'rule' ? (
            <div className="max-w-2xl w-full animate-fade-in">
              {/* 规则核心 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-6">
                <p className="text-lg text-[#264653] mb-2">一般过去时</p>
                <div className="flex items-center justify-center gap-4 text-2xl">
                  <span className="text-[#264653]">动词</span>
                  <span className="text-[#E76F51] text-3xl font-bold">+</span>
                  <span className="px-4 py-1 bg-[#E76F51]/10 border-2 border-[#E76F51] rounded-lg text-[#E76F51] font-bold text-3xl">
                    ed
                  </span>
                </div>
                <p className="text-sm text-[#264653]/50 mt-3">表示"过去发生了……"</p>
              </div>

              {/* 规则详解 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-[#2A9D8F] font-bold mb-1">一般情况</p>
                  <p className="text-[#264653]">直接 +ed</p>
                  <p className="text-sm text-[#264653]/50">walk → walked</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-[#2A9D8F] font-bold mb-1">以e结尾</p>
                  <p className="text-[#264653]">直接 +d</p>
                  <p className="text-sm text-[#264653]/50">like → liked</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-[#2A9D8F] font-bold mb-1">不规则</p>
                  <p className="text-[#264653]">特殊记忆</p>
                  <p className="text-sm text-[#264653]/50">find → found</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl w-full animate-fade-in">
              <div className="space-y-3">
                {pastTensePairs.map((item, i) => (
                  <div key={i}
                    className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4
                      hover:shadow-md transition-shadow animate-fly-from-bottom cursor-pointer
                      group"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 flex items-center justify-center gap-6">
                      <span className="text-[#264653] text-lg font-medium">{item.present}</span>
                      <span className="text-[#E76F51] text-xl transition-transform group-hover:scale-125">→</span>
                      <span className="text-[#2A9D8F] text-lg font-bold">{item.past}</span>
                    </div>
                    {/* 翻转卡片 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-[#264653]/50 bg-[#FFF3E0] px-2 py-1 rounded">
                        {item.present === 'walk' ? '走' :
                         item.present === 'help' ? '帮助' :
                         item.present === 'brush' ? '刷' :
                         item.present === 'find' ? '找到' : '醒来'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
