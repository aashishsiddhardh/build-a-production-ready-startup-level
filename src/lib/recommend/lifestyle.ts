import type { AssessmentInput, Dosha, LifestyleGuidance } from '@/types'

// Deterministic, dosha- and goal-aware lifestyle guidance. This is general
// educational wellness information (diet patterns, daily routine, gentle yoga,
// mindfulness) — never a prescription and never disease-specific medical advice.

const DOSHA_DIET: Record<Dosha, string[]> = {
  vata: [
    'Favour warm, moist, grounding foods: cooked grains, soups, stewed fruit, healthy fats.',
    'Keep regular meal times; avoid skipping meals or eating on the run.',
    'Reduce raw, cold, and dry foods (salads, crackers, iced drinks) when feeling ungrounded.',
  ],
  pitta: [
    'Favour cooling, hydrating foods: sweet fruit, cucumber, coconut, leafy greens, whole grains.',
    'Reduce very spicy, fried, fermented, and highly sour foods when feeling overheated.',
    'Avoid eating when angry or rushed; let meals be calm.',
  ],
  kapha: [
    'Favour light, warm, well-spiced foods: legumes, steamed vegetables, ginger and black pepper.',
    'Reduce heavy, oily, cold, and very sweet foods; keep dinners light and early.',
    'A little honey (not heated) and pungent spices can help lighten heaviness.',
  ],
}

const DOSHA_ROUTINE: Record<Dosha, string[]> = {
  vata: [
    'Anchor your day with consistent wake, meal, and sleep times.',
    'Try a warm self-massage (abhyanga) with sesame oil before a shower.',
    'Wind down screens early; keep evenings calm and warm.',
  ],
  pitta: [
    'Avoid over-scheduling; build in genuine breaks and time in nature.',
    'Favour cooling exercise (swimming, walks) during cooler parts of the day.',
    'Keep a moderate pace — intensity is your strength and your trap.',
  ],
  kapha: [
    'Rise a little earlier and move your body first thing to build momentum.',
    'Seek variety and stimulation; avoid long stretches of sitting.',
    'Dry-brush before showering to invigorate circulation.',
  ],
}

const DOSHA_YOGA: Record<Dosha, string[]> = {
  vata: [
    'Slow, grounding, warming flow with steady breath (e.g. gentle sun salutations, forward folds).',
    'Longer holds and restorative poses to calm the nervous system.',
    'Nadi shodhana (alternate-nostril breathing) to settle a busy mind.',
  ],
  pitta: [
    'Moderate, cooling practice; avoid overheating or competitive intensity.',
    'Twists, moon salutations, and gentle backbends to release tension.',
    'Sheetali (cooling breath) to temper heat and frustration.',
  ],
  kapha: [
    'Energising, warming flow to build heat and lightness (stronger sun salutations).',
    'Backbends and standing poses to open the chest and lift energy.',
    'Kapalabhati (only if comfortable) or brisk breathing to invigorate.',
  ],
}

const GOAL_TIPS: Record<string, { diet?: string; routine?: string; yoga?: string; mind?: string }> = {
  better_sleep: {
    routine: 'Keep a wind-down ritual and a consistent bedtime; dim lights an hour before bed.',
    mind: 'Try a 5–10 minute body-scan or slow breathing (longer exhales) before sleep.',
  },
  digestion: {
    diet: 'Eat your largest meal at midday when digestion is strongest; sip warm water, not iced.',
    routine: 'Take a short, gentle walk after meals instead of lying down.',
  },
  stress_resilience: {
    mind: 'Build a daily 10-minute mindfulness or breathing practice, even on good days.',
    routine: 'Protect one genuine, unscheduled break each day.',
  },
  energy: {
    diet: 'Prioritise steady, protein-inclusive meals and reduce heavy, sugary snacks that spike-then-crash.',
    routine: 'Get morning daylight within an hour of waking to steady your rhythm.',
  },
  immunity: {
    diet: 'Include warming spices (ginger, turmeric, black pepper) and colourful vegetables daily.',
    routine: 'Prioritise sleep and gentle daily movement; both underpin immune resilience.',
  },
  focus: {
    mind: 'Single-task in focused blocks; a brief breathing reset between blocks helps.',
    routine: 'Reduce fragmented screen-switching, especially in the first hour of the day.',
  },
  skin: {
    diet: 'Hydrate well and favour cooling, water-rich foods; reduce very oily and very spicy foods.',
    routine: 'Gentle, non-stripping cleansing and adequate sleep support skin repair.',
  },
  joint_comfort: {
    diet: 'Include anti-inflammatory foods (turmeric, omega-3 sources) and stay well hydrated.',
    yoga: 'Gentle mobility work and warm-ups; avoid pushing into sharp pain.',
  },
}

const BASE_MINDFULNESS = [
  'A few minutes of slow breathing daily is one of the most evidence-supported ways to lower everyday stress.',
  'Notice, name, and normalise difficult feelings rather than pushing them away.',
]

export function buildLifestyle(input: AssessmentInput, dominant: Dosha | null): LifestyleGuidance {
  const dosha = dominant ?? 'vata'
  const diet = [...DOSHA_DIET[dosha]]
  const routine = [...DOSHA_ROUTINE[dosha]]
  const yoga = [...DOSHA_YOGA[dosha]]
  const mindfulness = [...BASE_MINDFULNESS]

  for (const goal of input.goals) {
    const tip = GOAL_TIPS[goal]
    if (!tip) continue
    if (tip.diet) diet.push(tip.diet)
    if (tip.routine) routine.push(tip.routine)
    if (tip.yoga) yoga.push(tip.yoga)
    if (tip.mind) mindfulness.push(tip.mind)
  }

  // De-dupe while preserving order.
  const uniq = (arr: string[]) => [...new Set(arr)]
  return {
    diet: uniq(diet),
    routine: uniq(routine),
    yoga: uniq(yoga),
    mindfulness: uniq(mindfulness),
  }
}
