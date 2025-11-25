"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#a855f7", "#ec4899", "#3b82f6"],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#a855f7", "#ec4899", "#3b82f6"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 max-w-2xl w-full text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-7xl"
          >
            ✓
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-white mb-6"
        >
          Payment Successful! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300 mb-8"
        >
          Thank you for your payment. Your booking has been confirmed!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-8 bg-white/5"
        >
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="badge badge-success">Confirmed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confirmation Email:</span>
              <span className="text-white">Sent ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Step:</span>
              <span className="text-white">Check your email</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Link href="/dashboard" className="btn-primary w-full block">
            📊 View My Bookings
          </Link>
          <Link href="/properties" className="btn-secondary w-full block">
            🏠 Browse More Properties
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-8 border-t border-white/10"
        >
          <p className="text-gray-400 text-sm">
            Need help?{" "}
            <a
              href="/contact"
              className="text-purple-400 hover:text-purple-300"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
