import type { Dosha, LifestyleGuidance } from '@/lib/types';

/**
 * Dosha-specific lifestyle guidance. Deterministic, educational content —
 * classical dinacharya (daily routine), ahara (diet) and yoga suggestions.
 */
export const LIFESTYLE_LIBRARY: Record<Dosha, LifestyleGuidance[]> = {
  vata: [
    {
      category: 'diet',
      title: 'Warm, grounding, moist foods',
      dosha: 'vata',
      items: [
        'Favor cooked, warm meals: soups, stews, kitchari, root vegetables.',
        'Add healthy fats — ghee, sesame oil, soaked nuts.',
        'Use warming spices: ginger, cumin, cinnamon, cardamom.',
        'Reduce raw salads, dry/crunchy snacks, iced drinks and excess caffeine.',
        'Eat at regular times and stay well hydrated with warm water.',
      ],
    },
    {
      category: 'routine',
      title: 'Steady, calming daily rhythm',
      dosha: 'vata',
      items: [
        'Keep consistent sleep and meal times to counter vata’s irregularity.',
        'Try a warm sesame-oil self-massage (abhyanga) before bathing.',
        'Wind down early; avoid screens and stimulation late at night.',
        'Stay warm and protected from cold, dry wind.',
      ],
    },
    {
      category: 'yoga',
      title: 'Slow, grounding movement',
      dosha: 'vata',
      items: [
        'Gentle, grounding poses: forward folds, child’s pose, seated twists.',
        'Move slowly with the breath; avoid over-exertion.',
        'Practice long exhalations and alternate-nostril breathing (nadi shodhana).',
        'A short seated meditation to settle a busy mind.',
      ],
    },
  ],
  pitta: [
    {
      category: 'diet',
      title: 'Cooling, calming foods',
      dosha: 'pitta',
      items: [
        'Favor cooling foods: cucumber, leafy greens, sweet fruits, coconut, cilantro.',
        'Use cooling spices: coriander, fennel, mint, cardamom.',
        'Reduce spicy, fried, sour, salty and fermented foods and alcohol.',
        'Avoid skipping meals — pitta gets irritable when hungry.',
        'Prefer room-temperature or cool (not iced) drinks.',
      ],
    },
    {
      category: 'routine',
      title: 'Cool down and ease intensity',
      dosha: 'pitta',
      items: [
        'Avoid the midday sun and overheating; take time to cool off.',
        'Leave space for play and rest — don’t schedule every minute.',
        'A cooling coconut-oil massage can be soothing.',
        'Practice letting go of perfectionism and criticism.',
      ],
    },
    {
      category: 'yoga',
      title: 'Cooling, non-competitive practice',
      dosha: 'pitta',
      items: [
        'Moon salutations, gentle twists, forward folds and side stretches.',
        'Keep it non-competitive and avoid the hottest part of the day.',
        'Cooling breath (sheetali) and long exhalations.',
        'Loving-kindness or gratitude meditation.',
      ],
    },
  ],
  kapha: [
    {
      category: 'diet',
      title: 'Light, warm, stimulating foods',
      dosha: 'kapha',
      items: [
        'Favor light, warm, dry foods: steamed vegetables, legumes, barley, millet.',
        'Use stimulating spices: black pepper, ginger, turmeric, mustard seed.',
        'Reduce heavy, oily, sweet and cold foods, dairy and excess salt.',
        'A light or skipped breakfast can suit kapha; avoid late-night eating.',
        'Sip warm water with lemon or ginger through the day.',
      ],
    },
    {
      category: 'routine',
      title: 'Energize and vary your day',
      dosha: 'kapha',
      items: [
        'Wake early (before 6am) and avoid daytime naps.',
        'Seek novelty and movement to counter kapha’s inertia.',
        'Dry brushing (garshana) can invigorate the body.',
        'Declutter your space to lift heaviness and stagnation.',
      ],
    },
    {
      category: 'yoga',
      title: 'Vigorous, warming movement',
      dosha: 'kapha',
      items: [
        'Energizing sun salutations, standing poses and backbends.',
        'Build a bit of heat and break a light sweat.',
        'Stimulating breath (kapalabhati / bhastrika), practiced gently.',
        'Uplifting, movement-based meditation like a mindful walk.',
      ],
    },
  ],
};

/** Universal mind/lifestyle guidance offered to everyone. */
export const UNIVERSAL_GUIDANCE: LifestyleGuidance = {
  category: 'mind',
  title: 'Foundations for everyone',
  dosha: 'all',
  items: [
    'Aim for consistent, sufficient sleep — it is the foundation of ojas (vitality).',
    'Eat mindfully, without screens, and stop before you feel completely full.',
    'Move your body daily in a way you enjoy.',
    'Spend a few minutes in stillness or breathwork to steady the nervous system.',
    'These are general wellness practices, not treatment for any diagnosed condition.',
  ],
};
