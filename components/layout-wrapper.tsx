'use client'

import { NavigationHeader } from '@/components/navigation-header'
import { Toaster } from '@/components/ui/toaster'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const handleBookClick = () => {
    // This will be handled by the ChatbotWidget in the page
    const event = new CustomEvent('openChatbot')
    window.dispatchEvent(event)
  }

  return (
    <>
      <NavigationHeader onBookClick={handleBookClick} />
      {children}
      <Toaster />
    </>
  )
}
