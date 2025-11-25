"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["123 Luxury Avenue", "New York, NY 10001"],
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+1 (555) 123-4567", "Mon-Fri: 9AM - 6PM"],
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["info@luxuryestate.com", "support@luxuryestate.com"],
    },
    {
      icon: "💬",
      title: "Live Chat",
      details: ["Available 24/7", "Instant Response"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-7xl font-bold text-gray-900 mb-6">
            Get In <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {info.title}
              </h3>
              {info.details.map((detail, i) => (
                <p key={i} className="text-gray-600">
                  {detail}
                </p>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-12 shadow-xl shadow-blue-500/10"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 mb-2 font-semibold">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 mb-2 font-semibold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-900 mb-2 font-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 mb-2 font-semibold">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="property">Property Inquiry</option>
                    <option value="booking">Booking Question</option>
                    <option value="payment">Payment Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-semibold">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-h-[200px] resize-y"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xl py-6 rounded-xl font-semibold transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "📤 Send Message"
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <div className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-500/10">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Location
            </h2>
            <div className="h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200">
              <div className="text-center">
                <div className="text-8xl mb-4">🗺️</div>
                <p className="text-2xl text-gray-900 font-semibold mb-2">
                  123 Luxury Avenue, New York
                </p>
                <p className="text-gray-600">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
