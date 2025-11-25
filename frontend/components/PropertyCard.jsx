"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function PropertyCard({ property, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/properties/${property.slug}`}>
        <div className="property-card group">
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden rounded-t-2xl">
            {property.featured_image ? (
              <Image
                src={property.featured_image}
                alt={property.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                <span className="text-7xl opacity-50">🏠</span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`badge ${
                  property.status === "active"
                    ? "badge-success"
                    : "badge-warning"
                }`}
              >
                {property.status}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-white rounded-b-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {property.name}
            </h3>
            <p className="text-gray-600 flex items-center mb-4">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {property.location}
            </p>

            {/* Features */}
            <div className="flex items-center space-x-6 text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-sm">{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{property.bathrooms} Baths</span>
              </div>
            </div>

            {/* Price */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Starting from</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${parseFloat(property.price).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
