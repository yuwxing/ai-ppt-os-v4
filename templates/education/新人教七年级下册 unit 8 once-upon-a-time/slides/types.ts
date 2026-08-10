export interface SlideScript {
  speech: string
  timing_seconds: number
  emphasis: string[]
  pauses: string[]
}

export interface SlideAnimation {
  element: string
  animation: string
  delay: number
  duration: number
}

export interface QuizQuestion {
  type: 'choice' | 'open'
  question: string
  options?: string[]
  answer?: number
  explanation?: string
  hint?: string
}

export interface SlideData {
  page: number
  component: string
  layout: string
  title: string
  subtitle?: string
  content: string[]
  narrative: string
  goal: string
  emotion: string
  transition: string
  transition_duration: number
  animations: SlideAnimation[]
  script: SlideScript
  story_part?: number
  scene_type?: string
  quiz?: { questions: QuizQuestion[] }
}

export interface VocabItem {
  word: string
  past?: string
  meaning: string
}

export interface LessonData {
  meta: Record<string, string>
  design: {
    theme_name: string
    color_scheme: Record<string, string>
    fonts: Record<string, string>
    music: { url: string; volume: number; loop: boolean }
  }
  objectives: string[]
  vocabulary: Record<string, VocabItem[]>
  grammar: {
    title: string
    rule: string
    examples: { present: string; past: string }[]
    story_examples: string[]
  }
  slides: SlideData[]
}
