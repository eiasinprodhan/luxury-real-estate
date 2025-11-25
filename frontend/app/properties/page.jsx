"use client";

import PropertyCard from "@/components/PropertyCard";
import { propertiesAPI } from "@/utils/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    status: "active",
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await propertiesAPI.getAll({
        status: "active",
        ...params,
      });

      // Handle different response formats
      const data = response.data.results || response.data || [];
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading properties:", error);
      setError("Failed to load properties. Please try again.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params[key] = filters[key];
    });
    loadProperties(params);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: "",
      status: "active",
    });
    loadProperties({ status: "active" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.blue.300)_1px,_transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full blur-[128px] opacity-30 top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-indigo-400 rounded-full blur-[128px] opacity-30 bottom-0 right-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Explore <span className="text-blue-600">Luxury Properties</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Discover your perfect home from our exclusive collection of
              premium real estate
            </p>
          </motion.div>

          {/* Advanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10"
          >
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="md:col-span-2 px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price}
                  onChange={(e) =>
                    setFilters({ ...filters, min_price: e.target.value })
                  }
                  className="px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price}
                  onChange={(e) =>
                    setFilters({ ...filters, max_price: e.target.value })
                  }
                  className="px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bedrooms: e.target.value })
                  }
                  className="px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bathrooms: e.target.value })
                  }
                  className="px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">Bathrooms</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  🔍 Search Properties
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  🔄 Reset Filters
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="flex space-x-2 mb-6">
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              </div>
              <p className="text-gray-600 text-xl">Loading properties...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white border border-red-200 rounded-2xl p-12 md:p-20 text-center shadow-lg">
              <div className="text-6xl md:text-8xl mb-6">⚠️</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Something Went Wrong
              </h3>
              <p className="text-gray-600 text-lg md:text-xl mb-8">{error}</p>
              <button
                onClick={() => loadProperties({ status: "active" })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                🔄 Try Again
              </button>
            </div>
          )}

          {/* Properties Found */}
          {!loading && !error && properties.length > 0 && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {properties.length} Properties Found
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm">
                  <span className="text-gray-600">Sort by:</span>
                  <select className="bg-transparent text-gray-900 ml-2 outline-none font-medium">
                    <option value="latest">Latest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="bedrooms">Bedrooms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}

          {/* No Properties Found */}
          {!loading && !error && properties.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 md:p-20 text-center shadow-lg">
              <div className="text-6xl md:text-8xl mb-6">🔍</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                No Properties Found
              </h3>
              <p className="text-gray-600 text-lg md:text-xl mb-8">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
