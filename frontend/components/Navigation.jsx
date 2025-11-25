"use client";

import useAuthStore from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  const publicLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/properties", label: "Properties", icon: "🏘️" },
    { href: "/about", label: "About", icon: "ℹ️" },
    { href: "/contact", label: "Contact", icon: "📞" },
  ];

  const customerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  const adminLinks = [{ href: "/admin", label: "Admin Panel", icon: "⚙️" }];

  const navLinks = [
    ...publicLinks,
    ...(isAuthenticated && user?.user_type === "customer" ? customerLinks : []),
    ...(isAuthenticated && user?.user_type === "admin" ? adminLinks : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl font-bold">L</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Luxury<span className="text-blue-600">Estate</span>
                </h1>
                <p className="text-xs text-gray-500">Premium Properties</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated &&
                user?.user_type === "customer" &&
                customerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

              {isAuthenticated &&
                user?.user_type === "admin" &&
                adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.user_type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center bg-blue-600 text-white rounded-lg font-semibold"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
}
