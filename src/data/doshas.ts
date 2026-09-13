import type { Dosha } from '@/lib/types';

export interface DoshaMeta {
  id: Dosha;
  name: string;
  elements: string;
  tagline: string;
  qualities: string[];
  balanced: string;
  aggravated: string;
  color: string;
}

export const DOSHA_META: Record<Dosha, DoshaMeta> = {
  vata: {
    id: 'vata',
    name: 'Vata',
    elements: 'Air + Ether',
    tagline: 'Movement, creativity and change',
    qualities: ['light', 'dry', 'cold', 'mobile', 'subtle'],
    balanced: 'Energetic, imaginative, adaptable and enthusiastic.',
    aggravated: 'Anxious, restless, dry, irregular digestion and light sleep.',
    color: '#82a06d',
  },
  pitta: {
    id: 'pitta',
    name: 'Pitta',
    elements: 'Fire + Water',
    tagline: 'Transformation, focus and drive',
    qualities: ['hot', 'sharp', 'light', 'oily', 'intense'],
    balanced: 'Focused, warm, articulate, strong digestion and good leadership.',
    aggravated: 'Irritable, inflamed, acidic, overheated and overly critical.',
    color: '#d9861f',
  },
  kapha: {
    id: 'kapha',
    name: 'Kapha',
    elements: 'Earth + Water',
    tagline: 'Structure, stability and nourishment',
    qualities: ['heavy', 'slow', 'cool', 'oily', 'stable'],
    balanced: 'Calm, loving, grounded, strong immunity and steady stamina.',
    aggravated: 'Sluggish, congested, heavy, low motivation and slow to change.',
    color: '#63834e',
  },
};

export interface PrakritiQuestion {
  id: string;
  prompt: string;
  options: { dosha: Dosha; text: string }[];
}

export const PRAKRITI_QUESTIONS: PrakritiQuestion[] = [
  {
    id: 'frame',
    prompt: 'How would you describe your natural body frame?',
    options: [
      { dosha: 'vata', text: 'Thin, light, find it hard to gain weight' },
      { dosha: 'pitta', text: 'Medium, athletic, moderate build' },
      { dosha: 'kapha', text: 'Solid, sturdy, gain weight easily' },
    ],
  },
  {
    id: 'skin',
    prompt: 'Your skin tends to be…',
    options: [
      { dosha: 'vata', text: 'Dry, thin, rough or cool' },
      { dosha: 'pitta', text: 'Warm, sensitive, prone to redness or breakouts' },
      { dosha: 'kapha', text: 'Thick, smooth, oily, cool and moist' },
    ],
  },
  {
    id: 'appetite',
    prompt: 'How is your appetite and digestion?',
    options: [
      { dosha: 'vata', text: 'Variable — sometimes hungry, sometimes not; can bloat' },
      { dosha: 'pitta', text: 'Strong and sharp — get irritable if I skip meals' },
      { dosha: 'kapha', text: 'Steady but slow — can skip meals easily, digest slowly' },
    ],
  },
  {
    id: 'sleep',
    prompt: 'Your sleep pattern is usually…',
    options: [
      { dosha: 'vata', text: 'Light and easily interrupted' },
      { dosha: 'pitta', text: 'Moderate — wake feeling alert, may run hot' },
      { dosha: 'kapha', text: 'Deep and long — love to sleep in' },
    ],
  },
  {
    id: 'temperament',
    prompt: 'Under stress, you tend to become…',
    options: [
      { dosha: 'vata', text: 'Worried, anxious or scattered' },
      { dosha: 'pitta', text: 'Irritable, frustrated or critical' },
      { dosha: 'kapha', text: 'Withdrawn, quiet or unmotivated' },
    ],
  },
  {
    id: 'energy',
    prompt: 'Your energy through the day is…',
    options: [
      { dosha: 'vata', text: 'Comes in bursts, then dips quickly' },
      { dosha: 'pitta', text: 'Intense and driven, purposeful' },
      { dosha: 'kapha', text: 'Steady and enduring, slow to start' },
    ],
  },
  {
    id: 'weather',
    prompt: 'Which weather bothers you most?',
    options: [
      { dosha: 'vata', text: 'Cold, dry and windy' },
      { dosha: 'pitta', text: 'Hot and humid' },
      { dosha: 'kapha', text: 'Cold, damp and cloudy' },
    ],
  },
  {
    id: 'mind',
    prompt: 'How does your mind usually work?',
    options: [
      { dosha: 'vata', text: 'Quick, creative, jumps between ideas' },
      { dosha: 'pitta', text: 'Sharp, focused, logical and decisive' },
      { dosha: 'kapha', text: 'Calm, steady, methodical, great long-term memory' },
    ],
  },
  {
    id: 'weight',
    prompt: 'When it comes to weight, you…',
    options: [
      { dosha: 'vata', text: 'Struggle to gain and lose easily' },
      { dosha: 'pitta', text: 'Maintain fairly easily with effort' },
      { dosha: 'kapha', text: 'Gain easily and lose slowly' },
    ],
  },
];
