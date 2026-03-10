'use client'

import { Card } from '@/components/ui/card'

const reasons = [
  {
    id: 1,
    title: 'Expert Team',
    description: 'Highly certified dental professionals with extensive clinical experience',
  },
  {
    id: 2,
    title: 'Advanced Technology',
    description: 'Latest equipment and digital imaging for accurate diagnosis',
  },
  {
    id: 3,
    title: 'Patient Comfort',
    description: 'Relaxing environment and painless treatment options',
  },
  {
    id: 4,
    title: 'Flexible Scheduling',
    description: 'Convenient appointment times including emergencies',
  },
]

export function WhyUsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-4">Why Choose Us</p>
          <h2 className="text-5xl font-light mb-4 text-foreground">
            Trusted by <span className="font-semibold">Patients</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {reasons.map((reason) => (
            <div key={reason.id} className="pb-8 border-b border-border last:border-b-0 md:last:border-b md:odd:border-r md:odd:border-b-0">
              <h3 className="text-lg font-medium text-foreground mb-3">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
