"use client";

import PropertyCard from "@/components/PropertyCard";
import { propertiesAPI } from "@/utils/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll({ status: "active" });
      const data = response.data.results || response.data;
      setProperties(data.slice(0, 6));
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Properties", value: "500+", icon: "🏘️" },
    { label: "Happy Clients", value: "1000+", icon: "😊" },
    { label: "Awards", value: "50+", icon: "🏆" },
    { label: "Cities", value: "25+", icon: "🌆" },
  ];

  const features = [
    {
      title: "Premium Listings",
      description: "Handpicked selection of luxury properties",
      icon: "🏆",
    },
    {
      title: "Expert Guidance",
      description: "Professional support throughout",
      icon: "👨‍💼",
    },
    {
      title: "Secure Payments",
      description: "Multiple payment options available",
      icon: "🔒",
    },
    {
      title: "Virtual Tours",
      description: "3D property previews available",
      icon: "🏡",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Find Your Dream
              <span className="block text-blue-600">Luxury Property</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Discover exclusive real estate opportunities in prime locations
              worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="btn-primary text-lg px-10 py-4"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact"
                className="btn-secondary text-lg px-10 py-4"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="stat-card text-center"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide exceptional service and expertise in luxury real estate
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover-lift"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-4xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of premium listings
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/properties"
                  className="btn-primary text-lg px-10 py-4 inline-block"
                >
                  View All Properties
                </Link>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-600 text-lg">
                No properties available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Get started today and let us help you discover your dream home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300"
              >
                Get Started
              </Link>
              <Link
                href="/properties"
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Browse Properties
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
