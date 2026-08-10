import { useState } from 'react'
import { SlideData } from './types'

export default function GameSlide({ slide }: { slide: SlideData }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)

  const questions = slide.quiz?.questions || []
  const q = questions[currentQ]

  const handleAnswer = (index: number) => {
    if (answered !== null) return
    setAnswered(index)
    setShowResult(true)
    if (q.type === 'choice' && index === q.answer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setAnswered(null)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }

  const reset = () => {
    setCurrentQ(0)
    setScore(0)
    setAnswered(null)
    setShowResult(false)
    setFinished(false)
  }

  // 星空星星状态
  const starsFilled = Math.round((score / questions.filter(q => q.type === 'choice').length) * 5)

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #0D0D2B 0%, #1A1A4E 50%, #2D1B69 100%)',
        fontFamily: "'Microsoft YaHei', sans-serif"
      }}
    >
      {/* 星空背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col p-10">
        {finished ? (
          /* 结算页面 */
          <div className="flex-1 flex flex-col items-center justify-center animate-zoom-in">
            <div className="text-7xl mb-4">{starsFilled >= 4 ? '🌟' : starsFilled >= 3 ? '⭐' : '✨'}</div>
            <h2 className="text-3xl font-bold text-white mb-2">挑战完成！</h2>
            <p className="text-white/60 mb-6">
              得分：{score} / {questions.filter(q => q.type === 'choice').length}
            </p>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-3xl ${star <= starsFilled ? 'text-[#FFD700]' : 'text-white/20'}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-white/50 text-sm mb-6">
              {starsFilled >= 4 ? '太棒了！你是故事大师！' :
               starsFilled >= 3 ? '不错！再复习一下会更棒！' :
               '加油！多读几遍故事！'}
            </p>
            <button onClick={reset}
              className="px-6 py-2 bg-[#F4A261] text-white rounded-full hover:bg-[#E8924D] transition-colors"
            >
              再来一次
            </button>
          </div>
        ) : (
          <>
            {/* 顶部计分板 */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[#FFD700] text-lg">★</span>
                <span className="text-white font-bold">{score}</span>
              </div>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentQ ? 'bg-[#2A9D8F]' :
                      i === currentQ ? 'bg-[#F4A261]' :
                      'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/50 text-sm">{currentQ + 1}/{questions.length}</span>
            </div>

            {/* 题目区域 */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {q.type === 'choice' ? (
                <div className="w-full max-w-lg animate-zoom-in">
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6 text-center">
                    <p className="text-2xl mb-2">✨</p>
                    <p className="text-white text-lg">{q.question}</p>
                  </div>

                  <div className="space-y-3">
                    {q.options?.map((opt, i) => {
                      const isCorrect = i === q.answer
                      const isSelected = answered === i
                      const showFeedback = showResult

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={showFeedback}
                          className={`w-full p-4 rounded-xl text-left transition-all duration-300
                            ${!showFeedback ? 'bg-white/10 hover:bg-white/20 border border-white/10' : ''}
                            ${showFeedback && isCorrect ? 'bg-[#2A9D8F]/30 border-2 border-[#2A9D8F]' : ''}
                            ${showFeedback && isSelected && !isCorrect ? 'bg-[#E76F51]/30 border-2 border-[#E76F51]' : ''}
                            ${showFeedback && !isSelected && !isCorrect ? 'bg-white/10 border border-white/10 opacity-50' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              ${showFeedback && isCorrect ? 'bg-[#2A9D8F] text-white' :
                                showFeedback && isSelected && !isCorrect ? 'bg-[#E76F51] text-white' :
                                'bg-white/20 text-white'}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-white">{opt}</span>
                            {showFeedback && isCorrect && <span className="ml-auto text-[#2A9D8F]">✓</span>}
                            {showFeedback && isSelected && !isCorrect && <span className="ml-auto text-[#E76F51]">✗</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* 解释 */}
                  {showResult && q.explanation && (
                    <div className="mt-4 p-3 bg-white/10 rounded-xl animate-fade-in">
                      <p className="text-white/70 text-sm">💡 {q.explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 开放题 */
                <div className="w-full max-w-lg animate-zoom-in text-center">
                  <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
                    <p className="text-3xl mb-4">💭</p>
                    <p className="text-white text-lg mb-4">{q.question}</p>
                    {q.hint && (
                      <p className="text-white/50 text-sm">提示：{q.hint}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 下一步按钮 */}
            {showResult && (
              <div className="mt-6 text-center animate-fade-in">
                <button onClick={nextQuestion}
                  className="px-8 py-3 bg-[#F4A261] text-white rounded-full font-medium
                    hover:bg-[#E8924D] transition-colors shadow-lg"
                >
                  {currentQ < questions.length - 1 ? '下一颗星 →' : '查看结果'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
