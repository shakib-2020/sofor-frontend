'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on /dashboard and all its subroutes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer id="contact" className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo and Description */}
          <div className="mb-8 lg:mb-0">
            <Link href="/" className="mb-4 inline-block p-2 rounded-lg">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-slate-400">
              Your reliable partner for comfortable and safe bus journeys. Book your tickets with ease and travel with confidence.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-slate-400 transition-colors hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-slate-400 transition-colors hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-400 transition-colors hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-slate-400 transition-colors hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-400 transition-colors hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-slate-400" />
                <span className="text-slate-400">support@sofor.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-slate-400" />
                <span className="text-slate-400">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Address */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Our Office</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-slate-400" />
                <span className="text-slate-400">
                  123 Bus Station Road,
                  <br />
                  City Center, ST 12345
                  <br />
                  Country
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sofor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
