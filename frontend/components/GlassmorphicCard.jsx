"use client";

import { motion } from "framer-motion";

export default function GlassmorphicCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        backdrop-blur-lg bg-white/80 
        border border-blue-100 
        rounded-2xl p-6 
        shadow-xl shadow-blue-500/10
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
