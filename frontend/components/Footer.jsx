"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Our Team", href: "/about#team" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
    properties: [
      { label: "Browse All", href: "/properties" },
      { label: "Residential", href: "/properties?category=residential" },
      { label: "Commercial", href: "/properties?category=commercial" },
      { label: "Luxury Villas", href: "/properties?category=villa" },
    ],
    resources: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: "📘", label: "Facebook", href: "#" },
    { icon: "📸", label: "Instagram", href: "#" },
    { icon: "🐦", label: "Twitter", href: "#" },
    { icon: "💼", label: "LinkedIn", href: "#" },
    { icon: "📺", label: "YouTube", href: "#" },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🏰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Luxury<span className="text-blue-400">Estate</span>
                </h3>
                <p className="text-xs text-gray-400">Premium Properties</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner in luxury real estate. Discover exceptional
              properties and experience unparalleled service.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-blue-600/20 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Properties</h4>
            <ul className="space-y-3">
              {footerLinks.properties.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">
                Subscribe to Our Newsletter
              </h4>
              <p className="text-gray-400">
                Get the latest properties and exclusive offers delivered to your
                inbox
              </p>
            </div>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} LuxuryEstate. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center">
                <span className="mr-2">🔒</span>
                SSL Secured
              </span>
              <span className="flex items-center">
                <span className="mr-2">💳</span>
                Secure Payments
              </span>
              <span className="flex items-center">
                <span className="mr-2">✓</span>
                Verified Properties
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
