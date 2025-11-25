"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 max-w-2xl"
        >
          <div className="text-9xl mb-8">🏚️</div>
          <h1 className="text-8xl font-bold gradient-text mb-6">404</h1>
          <h2 className="text-4xl font-bold text-white mb-4">
            Property Not Found
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Oops! The page you're looking for doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              🏠 Go Home
            </Link>
            <Link href="/properties" className="btn-secondary">
              🔍 Browse Properties
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
