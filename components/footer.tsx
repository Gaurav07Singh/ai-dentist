'use client'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">SmileCare</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional dental care for your whole family.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition">Services</a></li>
              <li><a href="#doctors" className="hover:text-foreground transition">Our Team</a></li>
              <li><a href="#contact" className="hover:text-foreground transition">Contact</a></li>
              <li><a href="/admin/login" className="hover:text-foreground transition">Admin</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Routine Cleaning</a></li>
              <li><a href="#" className="hover:text-foreground transition">Implants</a></li>
              <li><a href="#" className="hover:text-foreground transition">Whitening</a></li>
              <li><a href="#" className="hover:text-foreground transition">Emergency Care</a></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Hours</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Mon-Fri: 9AM–6PM</li>
              <li>Saturday: 10AM–4PM</li>
              <li>Sunday: Closed</li>
              <li className="pt-2 border-t border-border">24/7 Emergency Line</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>&copy; 2024 SmileCare Dental Clinic. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
