import { useState } from 'react'
import { SlideData } from './types'

const roles = [
  { name: 'Lily', emoji: '🐰', lines: ['I am Lily! I am brave!', 'I found a bottle!', 'I helped a bird!'], color: '#F4A261' },
  { name: '小鸟', emoji: '🐦', lines: ['Help me, please!', 'Thank you, Lily!', 'Here is a star for you!'], color: '#2A9D8F' },
  { name: '大树', emoji: '🌳', lines: ['Welcome to the forest!', 'Be careful, Lily!', 'You are so kind!'], color: '#E76F51' },
  { name: '星星', emoji: '⭐', lines: ['Find me!', 'You can do it!', 'Believe in yourself!'], color: '#FFD700' },
]

export default function SpeakingSlide({ slide }: { slide: SlideData }) {
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [currentLine, setCurrentLine] = useState(0)

  const handleRoleSelect = (index: number) => {
    setSelectedRole(index)
    setCurrentLine(0)
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #2D1B0E 0%, #4A3728 50%, #5D4E37 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 舞台幕布装饰 */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#E76F51] via-[#F4A261] to-[#E76F51] opacity-80" />
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-[#E76F51] via-[#F4A261] to-[#E76F51] opacity-80" />
      <div className="absolute top-0 left-0 h-full w-3 bg-gradient-to-b from-[#E76F51] via-[#F4A261] to-[#E76F51] opacity-60" />
      <div className="absolute top-0 right-0 h-full w-3 bg-gradient-to-b from-[#E76F51] via-[#F4A261] to-[#E76F51] opacity-60" />

      <div className="relative z-10 h-full flex flex-col p-10">
        {/* 标题 */}
        <div className="text-center mb-6">
          <p className="text-sm text-[#F4A261] tracking-wider mb-1">✦ 读 者 剧 场 ✦</p>
          <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
        </div>

        <div className="flex-1 flex gap-8">
          {/* 角色选择区 */}
          <div className="w-1/3 space-y-3">
            <p className="text-white/60 text-sm mb-3">🎭 选择你的角色：</p>
            {roles.map((role, i) => (
              <button
                key={i}
                onClick={() => handleRoleSelect(i)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-300
                  ${selectedRole === i
                    ? 'bg-white/20 border-2 border-white shadow-lg scale-105'
                    : 'bg-white/10 border border-white/10 hover:bg-white/15'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.emoji}</span>
                  <div>
                    <p className="text-white font-medium">{role.name}</p>
                    <p className="text-white/50 text-xs">{role.lines.length} 句台词</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 台词区 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {selectedRole !== null ? (
              <div className="w-full max-w-md animate-fade-in">
                {/* 角色头像 */}
                <div className="text-center mb-6">
                  <span className="text-6xl">{roles[selectedRole].emoji}</span>
                  <p className="text-white text-xl font-bold mt-2">{roles[selectedRole].name}</p>
                </div>

                {/* 台词卡片 */}
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 min-h-[120px] flex items-center justify-center">
                  <p className="text-white text-xl text-center leading-relaxed">
                    "{roles[selectedRole].lines[currentLine]}"
                  </p>
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => setCurrentLine(Math.max(0, currentLine - 1))}
                    disabled={currentLine === 0}
                    className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  >
                    ← 上一句
                  </button>
                  <span className="text-white/50 text-sm self-center">
                    {currentLine + 1} / {roles[selectedRole].lines.length}
                  </span>
                  <button
                    onClick={() => setCurrentLine(Math.min(roles[selectedRole].lines.length - 1, currentLine + 1))}
                    disabled={currentLine === roles[selectedRole].lines.length - 1}
                    className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
                  >
                    下一句 →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40">
                <p className="text-6xl mb-4">🎭</p>
                <p>选择一个角色开始表演</p>
              </div>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-4 text-center">
          <p className="text-white/50 text-sm">
            💡 记得加上动作和表情，让故事活起来！全班投票选出最佳表演组。
          </p>
        </div>
      </div>
    </div>
  )
}
