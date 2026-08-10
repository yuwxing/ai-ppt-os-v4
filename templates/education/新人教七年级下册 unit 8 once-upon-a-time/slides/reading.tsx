import { useState } from 'react'
import { SlideData } from './types'

export default function ReadingSlide({ slide }: { slide: SlideData }) {
  const [showExample, setShowExample] = useState(true)
  const [studentText, setStudentText] = useState('')

  const diaryExample = `Dear Diary,
Today I found a bottle in the forest.
I was afraid, but I opened it.
There was a note inside.
I need to find three stars.
I helped a bird. She gave me a star.
I am brave!
— Lily 🐰`

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 50%, #FFE8C8 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      <div className="h-full flex p-8 gap-8">
        {/* 左侧日记区域 */}
        <div className="w-1/2 flex flex-col">
          <div className="mb-4">
            <p className="text-sm text-[#E76F51] tracking-wider">✦ 角 色 心 声 ✦</p>
            <h2 className="text-3xl font-bold text-[#264653]">{slide.title}</h2>
          </div>

          {/* 日记本 */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 transform rotate-1"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8E0D4 27px, #E8E0D4 28px)',
                fontFamily: "'Segoe UI', Arial, sans-serif"
              }}
            >
              {showExample ? (
                <div className="relative">
                  {/* 装订线 */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#E76F51]/5 rounded-l-2xl" />
                  {/* 装饰贴纸 */}
                  <div className="absolute top-2 right-2 text-lg opacity-50">⭐ 🐾</div>

                  <pre className="text-sm text-[#264653] leading-7 whitespace-pre-wrap pl-6 pt-4">
                    {diaryExample}
                  </pre>

                  <button
                    onClick={() => { setShowExample(false); setStudentText('') }}
                    className="mt-4 px-4 py-2 bg-[#2A9D8F] text-white rounded-xl text-sm
                      hover:bg-[#238B7D] transition-colors ml-6"
                  >
                    ✍️ 我也来写
                  </button>
                </div>
              ) : (
                <div className="pl-6 pt-4">
                  <p className="text-sm text-[#264653]/50 mb-3">用过去式写3-5句话：</p>
                  <textarea
                    value={studentText}
                    onChange={(e) => setStudentText(e.target.value)}
                    placeholder="I found a bottle. I was afraid. But I was brave..."
                    className="w-full h-40 bg-transparent border-0 outline-none resize-none
                      text-sm text-[#264653] leading-7 placeholder-[#264653]/30"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8E0D4 27px, #E8E0D4 28px)'
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setShowExample(true)}
                      className="px-3 py-1 text-xs text-[#2A9D8F] border border-[#2A9D8F] rounded-lg hover:bg-[#2A9D8F]/5"
                    >
                      ← 返回示例
                    </button>
                    {studentText && (
                      <span className="text-xs text-[#2A9D8F] self-center">
                        ✅ 已写 {studentText.split('.').filter(s => s.trim()).length} 句
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧引导 */}
        <div className="w-1/2 flex flex-col justify-center gap-4">
          <div className="space-y-3">
            {slide.content.map((item, i) => (
              <div key={i}
                className="flex items-start gap-3 p-3 bg-white/60 rounded-xl animate-fly-from-bottom"
                style={{ animationDelay: `${0.3 + i * 0.2}s` }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F4A261] text-white text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[#264653] text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* 引导问题 */}
          <div className="p-4 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
            <p className="text-[#2A9D8F] font-medium mb-2">💭 讨论</p>
            <p className="text-[#264653]/80 text-sm">你从 Lily 身上学到了什么？用 3 个英语词概括。</p>
            <div className="flex gap-2 mt-2">
              {['kind', 'brave', 'helpful'].map((w) => (
                <span key={w} className="px-2 py-1 bg-white rounded text-xs text-[#264653]">{w}</span>
              ))}
            </div>
          </div>

          {/* 写作提示 */}
          <div className="flex flex-wrap gap-2">
            {['I found...', 'I was...', 'I helped...', 'I felt...', 'I learned...'].map((prompt, i) => (
              <span key={i}
                className="px-3 py-1 bg-white/60 border border-[#F4A261]/30 rounded-full text-xs text-[#264653]"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
