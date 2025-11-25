"use client";

import PropertyCard from "@/components/PropertyCard";
import useAuthStore from "@/store/authStore";
import { bookingsAPI, propertiesAPI } from "@/utils/api";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// 3D Model Component
function Property3DModel() {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[2, 1.5, 2]} />
      <meshStandardMaterial color="#2563eb" />
    </mesh>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex space-x-2 justify-center mb-6">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        <p className="text-gray-900 text-2xl">Loading property details...</p>
      </div>
    </div>
  );
}

// Error Component
function ErrorDisplay({ error, onRetry, slug }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl p-8 md:p-12 shadow-xl max-w-md w-full">
        <div className="text-6xl md:text-8xl mb-6">😕</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {error}
        </h2>
        <p className="text-gray-600 mb-8">
          The property you&apos;re looking for might have been removed or
          doesn&apos;t exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            🔄 Try Again
          </button>
          <Link
            href="/properties"
            className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-center"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  // Hooks
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // State
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("10:00");
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get slug from params
  const slug = params?.slug;

  // Debug logging
  useEffect(() => {
    console.log("=== PropertyDetail Component Mounted ===");
    console.log("Params:", params);
    console.log("Slug:", slug);
  }, [params, slug]);

  // Load property function
  const loadProperty = useCallback(async () => {
    if (!slug) {
      console.log("No slug available, skipping load");
      setLoading(false);
      setError("Property identifier not found");
      return;
    }

    console.log("Loading property with slug:", slug);
    setLoading(true);
    setError(null);

    try {
      // Load main property
      console.log("Making API request to get property:", slug);
      const propResponse = await propertiesAPI.getOne(slug);
      console.log("Property API Response:", propResponse);

      if (propResponse.data) {
        console.log("Property data received:", propResponse.data);
        setProperty(propResponse.data);
      } else {
        throw new Error("No property data received");
      }

      // Load similar properties (optional - don't fail if this fails)
      try {
        const similarResponse = await propertiesAPI.getSimilar(slug);
        const similarData =
          similarResponse.data?.results || similarResponse.data || [];
        setSimilarProperties(
          Array.isArray(similarData) ? similarData.slice(0, 3) : []
        );
        console.log("Similar properties loaded:", similarData.length);
      } catch (similarError) {
        console.log("Could not load similar properties:", similarError.message);
        setSimilarProperties([]);
      }
    } catch (error) {
      console.error("=== Error Loading Property ===");
      console.error("Error:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      if (error.response?.status === 404) {
        setError("Property not found");
      } else if (error.response?.status === 401) {
        setError("Please login to view this property");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this property");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection.");
      } else {
        setError(
          error.response?.data?.detail ||
            error.message ||
            "Failed to load property"
        );
      }
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Load property when slug changes
  useEffect(() => {
    if (slug) {
      loadProperty();
    }
  }, [slug, loadProperty]);

  // Handle booking
  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a property");
      router.push(`/login?redirect=/properties/${slug}`);
      return;
    }

    if (!visitDate) {
      toast.error("Please select a visit date");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Please select a future date");
      return;
    }

    setBookingLoading(true);

    try {
      const bookingData = {
        property: property.id,
        visit_date: visitDate,
        visit_time: visitTime,
      };

      console.log("Creating booking:", bookingData);
      const response = await bookingsAPI.create(bookingData);
      console.log("Booking response:", response);

      toast.success("Booking created successfully!");
      router.push(`/checkout/${response.data.id}`);
    } catch (error) {
      console.error("Booking error:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Booking failed. Please try again.";

      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "3d-view", label: "3D View", icon: "🏗️" },
    { id: "amenities", label: "Amenities", icon: "✨" },
    { id: "location", label: "Location", icon: "📍" },
  ];

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={loadProperty} slug={slug} />;
  }

  // Render no property state
  if (!property) {
    return (
      <ErrorDisplay
        error="Property not found"
        onRetry={loadProperty}
        slug={slug}
      />
    );
  }

  // Get property images
  const propertyImages = property.images || [];
  const mainImage = property.featured_image || propertyImages[0]?.image || null;

  // Format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "Price on request";
    return `$${numPrice.toLocaleString()}`;
  };

  // Get minimum date for booking (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Image Section */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={property.name || "Property"}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.log("Image failed to load:", mainImage);
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center">
            <span className="text-9xl opacity-50">🏠</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

        {/* Back Button */}
        <Link
          href="/properties"
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Properties
        </Link>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${
                    property.status === "active"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : property.status === "sold"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  }`}
                >
                  {property.status || "Available"}
                </span>
                {property.category && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {typeof property.category === "object"
                      ? property.category.name
                      : property.category}
                  </span>
                )}
                {property.is_featured && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Property Title */}
              <h1 className="text-3xl md:text-6xl font-bold text-white mb-4">
                {property.name || property.title || "Unnamed Property"}
              </h1>

              {/* Location */}
              <p className="text-lg md:text-2xl text-gray-200 flex items-center">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {property.location ||
                  property.address ||
                  "Location not specified"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Gallery (if multiple images) */}
      {propertyImages.length > 1 && (
        <section className="py-4 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {propertyImages.map((img, index) => (
                <button
                  key={img.id || index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-blue-600 ring-2 ring-blue-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img.image}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Tabs Navigation */}
              <div className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-2 flex flex-wrap gap-2 shadow-lg shadow-blue-500/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[100px] px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <span className="mr-1 md:mr-2">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Property Overview
                  </h2>

                  {/* Description */}
                  <div className="mb-8">
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
                      {property.description ||
                        "No description available for this property."}
                    </p>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center p-4 md:p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                        🛏️
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                        {property.bedrooms || 0}
                      </div>
                      <div className="text-gray-600 text-sm md:text-base">
                        Bedrooms
                      </div>
                    </div>

                    <div className="text-center p-4 md:p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                        🚿
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                        {property.bathrooms || 0}
                      </div>
                      <div className="text-gray-600 text-sm md:text-base">
                        Bathrooms
                      </div>
                    </div>

                    {(property.square_feet || property.area) && (
                      <div className="text-center p-4 md:p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                          📐
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                          {(
                            property.square_feet || property.area
                          ).toLocaleString()}
                        </div>
                        <div className="text-gray-600 text-sm md:text-base">
                          Sq Ft
                        </div>
                      </div>
                    )}

                    <div className="text-center p-4 md:p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                        🏷️
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1 md:mb-2">
                        {formatPrice(property.price)}
                      </div>
                      <div className="text-gray-600 text-sm md:text-base">
                        Price
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(property.year_built ||
                    property.garage ||
                    property.lot_size) && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.year_built && (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                              <div className="text-sm text-gray-500">
                                Year Built
                              </div>
                              <div className="font-semibold text-gray-900">
                                {property.year_built}
                              </div>
                            </div>
                          </div>
                        )}
                        {property.garage && (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🚗</span>
                            <div>
                              <div className="text-sm text-gray-500">
                                Garage
                              </div>
                              <div className="font-semibold text-gray-900">
                                {property.garage} Cars
                              </div>
                            </div>
                          </div>
                        )}
                        {property.lot_size && (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🌳</span>
                            <div>
                              <div className="text-sm text-gray-500">
                                Lot Size
                              </div>
                              <div className="font-semibold text-gray-900">
                                {property.lot_size} Sq Ft
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 3D View Tab */}
              {activeTab === "3d-view" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    3D Property View
                  </h2>
                  <div className="h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200">
                    <Canvas>
                      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
                      <OrbitControls
                        enableZoom={true}
                        enablePan={true}
                        maxPolarAngle={Math.PI / 2}
                      />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1} />
                      <pointLight position={[-10, -10, -5]} intensity={0.5} />
                      <Suspense fallback={null}>
                        <Property3DModel />
                        <gridHelper args={[10, 10]} />
                      </Suspense>
                    </Canvas>
                  </div>
                  <p className="text-gray-600 text-center mt-4 text-sm md:text-base">
                    🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
                  </p>
                </motion.div>
              )}

              {/* Amenities Tab */}
              {activeTab === "amenities" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Amenities & Features
                  </h2>

                  {property.amenities && property.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenities.map((amenity, index) => {
                        const amenityName =
                          typeof amenity === "object" ? amenity.name : amenity;
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-900 font-semibold">
                              {amenityName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🏠</span>
                      <p className="text-gray-600 text-lg">
                        No amenities listed for this property
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Location Tab */}
              {activeTab === "location" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Location
                  </h2>

                  <div className="h-[300px] md:h-[400px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200 mb-6">
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl mb-4">📍</div>
                      <p className="text-xl md:text-2xl text-gray-900 font-semibold mb-2">
                        {property.location ||
                          property.address ||
                          "Location not specified"}
                      </p>
                      <p className="text-gray-600">
                        Interactive map coming soon
                      </p>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.city && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">🏙️</span>
                        <div>
                          <div className="text-sm text-gray-500">City</div>
                          <div className="font-semibold text-gray-900">
                            {property.city}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.state && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">🗺️</span>
                        <div>
                          <div className="text-sm text-gray-500">State</div>
                          <div className="font-semibold text-gray-900">
                            {property.state}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.zip_code && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">📮</span>
                        <div>
                          <div className="text-sm text-gray-500">ZIP Code</div>
                          <div className="font-semibold text-gray-900">
                            {property.zip_code}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.country && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="text-sm text-gray-500">Country</div>
                          <div className="font-semibold text-gray-900">
                            {property.country}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/10 sticky top-24">
                {/* Price */}
                <div className="mb-6 md:mb-8">
                  <div className="text-gray-600 text-sm mb-2">
                    Starting Price
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </div>
                  {property.price_per_sqft && (
                    <div className="text-gray-500 text-sm mt-1">
                      ${property.price_per_sqft}/sq ft
                    </div>
                  )}
                </div>

                {/* Booking Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-900 mb-2 font-semibold">
                      📅 Visit Date
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 mb-2 font-semibold">
                      🕐 Preferred Time
                    </label>
                    <select
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || property.status === "sold"}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 mb-4 flex items-center justify-center"
                >
                  {bookingLoading ? (
                    <>
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
                      Processing...
                    </>
                  ) : property.status === "sold" ? (
                    "🚫 Sold Out"
                  ) : (
                    "📅 Book a Viewing"
                  )}
                </button>

                {/* Login Notice */}
                {!isAuthenticated && (
                  <p className="text-gray-500 text-sm text-center mb-4">
                    You&apos;ll need to{" "}
                    <Link
                      href={`/login?redirect=/properties/${slug}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      login
                    </Link>{" "}
                    to book a viewing
                  </p>
                )}

                {/* Contact Agent Button */}
                <Link
                  href="/contact"
                  className="block w-full border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 text-center"
                >
                  💬 Contact Agent
                </Link>

                {/* Agent Info */}
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">
                        {property.agent?.name || "Premium Agent"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Available 24/7
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Our expert agents are here to help you find your perfect
                    property
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  <button className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center">
                    <span className="text-xl">❤️</span>
                    <div className="text-xs text-gray-600 mt-1">Save</div>
                  </button>
                  <button className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center">
                    <span className="text-xl">📤</span>
                    <div className="text-xs text-gray-600 mt-1">Share</div>
                  </button>
                  <button className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center">
                    <span className="text-xl">🖨️</span>
                    <div className="text-xs text-gray-600 mt-1">Print</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Similar Properties
              </h2>
              <p className="text-gray-600 text-lg">
                You might also be interested in these properties
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {similarProperties.map((prop, index) => (
                <PropertyCard key={prop.id} property={prop} index={index} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                View All Properties
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make This Your Home?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Don&apos;t miss out on this amazing property. Schedule a viewing
            today or contact our team for more information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push(`/login?redirect=/properties/${slug}`);
                } else {
                  setActiveTab("overview");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              📅 Schedule Viewing
            </button>
            <Link
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              💬 Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
