import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import RootLayout from '@/app/layout'
import fs from 'fs'
import path from 'path'

describe('Landing Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByText('CapMan AI')).toBeInTheDocument()
  })
})

describe('Root Layout', () => {
  it('includes html lang attribute and body', () => {
    // We can't render RootLayout directly with RTL due to html/body,
    // but we can verify the function exists and returns JSX
    const layout = RootLayout({ children: <div>test</div> })
    expect(layout).toBeTruthy()
    expect(layout.props.lang).toBe('en')
    expect(layout.props.className).toContain('dark')
    expect(layout.props.suppressHydrationWarning).toBe(true)
  })
})

describe('globals.css', () => {
  it('contains dark theme CSS custom properties', () => {
    const cssPath = path.resolve(__dirname, '../app/globals.css')
    const css = fs.readFileSync(cssPath, 'utf-8')
    expect(css).toContain('--background:')
    expect(css).toContain('--primary:')
    expect(css).toContain('--destructive:')
    expect(css).toContain('--card:')
  })
})
