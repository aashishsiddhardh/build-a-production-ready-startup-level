import type { Dosha } from '@/types'

export interface DoshaQuestion {
  id: string
  prompt: string
  options: { label: string; dosha: Dosha }[]
}

// A compact, well-balanced Prakriti (constitution) questionnaire. Each question
// offers one option per dosha; the tally produces a constitutional profile that
// feeds the "constitutional alignment" component of the recommendation score.
export const DOSHA_QUESTIONS: DoshaQuestion[] = [
  {
    id: 'body_frame',
    prompt: 'Which best describes your natural body frame?',
    options: [
      { label: 'Thin, light, find it hard to gain weight', dosha: 'vata' },
      { label: 'Medium, muscular, gain and lose easily', dosha: 'pitta' },
      { label: 'Solid, sturdy, gain weight easily', dosha: 'kapha' },
    ],
  },
  {
    id: 'skin',
    prompt: 'How is your skin most of the time?',
    options: [
      { label: 'Dry, thin, cool to touch', dosha: 'vata' },
      { label: 'Warm, prone to redness or breakouts', dosha: 'pitta' },
      { label: 'Thick, smooth, oily, cool', dosha: 'kapha' },
    ],
  },
  {
    id: 'appetite',
    prompt: 'Your appetite and digestion tend to be…',
    options: [
      { label: 'Irregular, variable, sometimes gassy', dosha: 'vata' },
      { label: 'Strong, sharp, irritable if I skip meals', dosha: 'pitta' },
      { label: 'Slow but steady, can skip meals easily', dosha: 'kapha' },
    ],
  },
  {
    id: 'temperament',
    prompt: 'Under stress, you most often feel…',
    options: [
      { label: 'Anxious, worried, scattered', dosha: 'vata' },
      { label: 'Irritable, frustrated, critical', dosha: 'pitta' },
      { label: 'Withdrawn, sluggish, or avoidant', dosha: 'kapha' },
    ],
  },
  {
    id: 'sleep',
    prompt: 'Your sleep is usually…',
    options: [
      { label: 'Light, easily disturbed', dosha: 'vata' },
      { label: 'Moderate; I wake feeling hot sometimes', dosha: 'pitta' },
      { label: 'Deep, long, hard to wake up', dosha: 'kapha' },
    ],
  },
  {
    id: 'energy',
    prompt: 'Your energy through the day is…',
    options: [
      { label: 'Comes in bursts, then dips', dosha: 'vata' },
      { label: 'Intense and focused', dosha: 'pitta' },
      { label: 'Steady and enduring', dosha: 'kapha' },
    ],
  },
  {
    id: 'weather',
    prompt: 'Which weather bothers you most?',
    options: [
      { label: 'Cold, dry, windy', dosha: 'vata' },
      { label: 'Hot, humid, bright sun', dosha: 'pitta' },
      { label: 'Cold, damp, cloudy', dosha: 'kapha' },
    ],
  },
  {
    id: 'pace',
    prompt: 'Your natural pace and speech is…',
    options: [
      { label: 'Quick, talkative, energetic', dosha: 'vata' },
      { label: 'Sharp, precise, purposeful', dosha: 'pitta' },
      { label: 'Slow, calm, methodical', dosha: 'kapha' },
    ],
  },
]
