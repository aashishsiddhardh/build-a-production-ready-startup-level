import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ResultsPage from '@/pages/ResultsPage';
import { generateRecommendations } from '@/engine/recommender';
import { store } from '@/lib/storage';
import type { AssessmentInput, StoredAssessment } from '@/lib/types';

function seed(input: AssessmentInput): string {
  const result = generateRecommendations(input);
  const stored: StoredAssessment = { ...result, userId: 'u1' };
  store.addAssessment(stored);
  return stored.id;
}

function renderAt(id: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/results/${id}`]}>
        <Routes>
          <Route path="/results/:id" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const baseProfile = {
  age: 34,
  sexAtBirth: 'female' as const,
  pregnant: false,
  breastfeeding: false,
  conditions: [],
  medications: [],
  allergies: '',
};

describe('ResultsPage (smoke)', () => {
  beforeEach(() => localStorage.clear());

  it('renders wellness guidance with recommendations for a self-care result', () => {
    const id = seed({
      profile: baseProfile,
      prakritiAnswers: { frame: 'vata', skin: 'vata', appetite: 'vata', sleep: 'vata' },
      concerns: ['stress-anxiety', 'poor-sleep'],
      narrative: 'I feel wired and cannot sleep.',
      redFlagAnswers: {},
      consentAccepted: true,
    });
    renderAt(id);
    expect(screen.getByText('Your wellness guidance')).toBeInTheDocument();
    expect(screen.getByText('Suggested herbs & formulations')).toBeInTheDocument();
    expect(screen.getAllByText('Constitution').length).toBeGreaterThan(0);
  });

  it('withholds herbal guidance and shows the emergency card for a red-flag result', () => {
    const id = seed({
      profile: baseProfile,
      prakritiAnswers: { frame: 'pitta' },
      concerns: ['stress-anxiety'],
      narrative: 'I have crushing chest pain radiating to my arm and shortness of breath.',
      redFlagAnswers: { chestPain: true },
      consentAccepted: true,
    });
    renderAt(id);
    expect(screen.getByText('Your wellness guidance')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Recommendations section must NOT render when triage blocks.
    expect(screen.queryByText('Suggested herbs & formulations')).not.toBeInTheDocument();
    expect(screen.getByText('Care-first')).toBeInTheDocument();
  });
});
