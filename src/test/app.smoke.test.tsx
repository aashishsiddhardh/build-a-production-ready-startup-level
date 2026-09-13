import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import App from '@/App'

afterEach(() => cleanup())

describe('app smoke test', () => {
  it('mounts and renders the public landing page without crashing', async () => {
    render(<App />)
    // Hero headline copy from the Landing page.
    expect(await screen.findByText(/responsibly guided/i)).toBeInTheDocument()
    // Primary CTA is present.
    expect(screen.getAllByText(/knowledge base/i).length).toBeGreaterThan(0)
  })
})
