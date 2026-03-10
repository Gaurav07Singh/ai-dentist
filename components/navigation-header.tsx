'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Menu, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface NavigationHeaderProps {
  onBookClick?: () => void
}

export function NavigationHeader({ onBookClick }: NavigationHeaderProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary"></div>
          <span className="text-xl font-semibold">SmileCare</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
            My Appointments
          </Link>
          <Link href="/chatbot" className="text-sm font-medium hover:text-primary transition-colors">
            Book Appointment
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/appointments">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Button>
          </Link>
          <Link href="/chatbot">
            <Button size="sm">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/appointments"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Appointments
            </Link>
            <Link
              href="/chatbot"
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Appointment
            </Link>
            <div className="pt-3 border-t space-y-2">
              <Link href="/appointments" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Appointments
                </Button>
              </Link>
              <Link href="/chatbot" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
