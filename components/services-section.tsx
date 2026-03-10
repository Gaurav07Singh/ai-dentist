'use client'

import { Card } from '@/components/ui/card'

const services = [
  {
    id: 1,
    title: 'Routine Cleaning',
    description: 'Professional cleaning and preventative care',
  },
  {
    id: 2,
    title: 'Implants',
    description: 'Long-lasting tooth replacement solutions',
  },
  {
    id: 3,
    title: 'Orthodontics',
    description: 'Straighten your teeth and improve alignment',
  },
  {
    id: 4,
    title: 'Whitening',
    description: 'Professional teeth brightening treatments',
  },
  {
    id: 5,
    title: 'Root Canal',
    description: 'Endodontic treatment to save natural teeth',
  },
  {
    id: 6,
    title: 'Emergency Care',
    description: 'Prompt relief for dental emergencies',
  },
]

export function ServicesSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl sm:max-w-7xl lg:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Services</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-foreground">
            Quality Care for <span className="font-semibold">Every Need</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            We offer comprehensive dental services using advanced techniques and technology.
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-border rounded-lg overflow-hidden">
          {services.map((service) => (
            <div key={service.id} className="bg-background p-4 sm:p-6 border border-border hover:bg-muted/50 transition-colors">
              <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2 sm:mb-3">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
