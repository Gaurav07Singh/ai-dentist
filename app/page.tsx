'use client'

import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { WhyUsSection } from '@/components/why-us-section'
import { DoctorsSection } from '@/components/doctors-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { ContactSection } from '@/components/contact-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <DoctorsSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
