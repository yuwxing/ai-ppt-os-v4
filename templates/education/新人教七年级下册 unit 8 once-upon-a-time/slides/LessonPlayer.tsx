import { useState, useCallback, useEffect, useRef } from 'react'
import type { LessonData } from './types'
import CoverSlide from './cover'
import WarmupSlide from './warmup'
import VocabularySlide from './vocabulary'
import StorySlide from './story'
import AnimationSlide from './animation'
import GrammarSlide from './grammar'
import ReadingSlide from './reading'
import SpeakingSlide from './speaking'
import GameSlide from './game'
import SummarySlide from './summary'
import HomeworkSlide from './homework'

interface LessonPlayerProps {
  lesson: LessonData
  onComplete?: () => void
  initialPage?: number
}

const components: Record<string, React.FC<{ slide: any }>> = {
  cover: CoverSlide,
  warmup: WarmupSlide,
  vocabulary: VocabularySlide,
  story: StorySlide,
  animation: AnimationSlide,
  grammar: GrammarSlide,
  reading: ReadingSlide,
  speaking: SpeakingSlide,
  game: GameSlide,
  summary: SummarySlide,
  homework: HomeworkSlide,
}

export default function LessonPlayer({ lesson, onComplete, initialPage = 0 }: LessonPlayerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const slides = lesson.slides
  const totalPages = slides.length
  const slide = slides[currentPage]
  const SlideComponent = components[slide.component]

  useEffect(() => {
    // 背景音乐
    if (lesson.design?.music?.url) {
      audioRef.current = new Audio(lesson.design.music.url)
      audioRef.current.volume = lesson.design.music.volume || 0.15
      audioRef.current.loop = lesson.design.music.loop !== false
      if (isPlaying) audioRef.current.play()
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [isPlaying, lesson.design?.music?.url])

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      onComplete?.()
    }
  }, [currentPage, totalPages, onComplete])

  const goPrev = useCallback(() => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }, [currentPage])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      goNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    }
  }, [goNext, goPrev])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ aspectRatio: '16/9' }}>
      {/* 幻灯片容器 */}
      <div className="w-full h-full rounded-2xl shadow-2xl overflow-hidden">
        {SlideComponent ? (
          <SlideComponent slide={slide} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-400">未知组件: {slide.component}</p>
          </div>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="absolute -bottom-14 left-0 right-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* 音乐开关 */}
          {lesson.design?.music?.url && (
            <button onClick={toggleMusic}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
              title={isPlaying ? '关闭音乐' : '开启音乐'}
            >
              {isPlaying ? '🔊' : '🔇'}
            </button>
          )}
          {/* 页码指示 */}
          <span className="text-sm text-gray-500">
            {currentPage + 1} / {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 进度条 */}
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentPage
                    ? 'bg-[#F4A261] w-6'
                    : i < currentPage
                    ? 'bg-[#2A9D8F]'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* 导航按钮 */}
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              disabled={currentPage === 0}
              className="px-4 py-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm
                disabled:opacity-30 transition-colors text-sm"
            >
              ← 上一页
            </button>
            <button
              onClick={goNext}
              className="px-4 py-1.5 rounded-lg bg-[#F4A261] text-white hover:bg-[#E8924D]
                shadow-sm transition-colors text-sm"
            >
              {currentPage < totalPages - 1 ? '下一页 →' : '完成 ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
