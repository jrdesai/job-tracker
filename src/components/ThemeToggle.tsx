'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  )
}
