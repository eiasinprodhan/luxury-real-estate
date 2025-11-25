"use client";

import useAuthStore from "@/store/authStore";
import { bookingsAPI, paymentsAPI } from "@/utils/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        bookingsAPI.getAll(),
        paymentsAPI.getAll(),
      ]);
      setBookings(bookingsRes.data.results || bookingsRes.data);
      setPayments(paymentsRes.data.results || paymentsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingsAPI.cancel(bookingId);
      toast.success("Booking canceled successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge-warning",
      paid: "badge-success",
      canceled: "badge-danger",
      completed: "badge-info",
      success: "badge-success",
      failed: "badge-danger",
    };
    return badges[status] || "badge-info";
  };

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: "📅",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      label: "Active Bookings",
      value: bookings.filter((b) => ["pending", "paid"].includes(b.status))
        .length,
      icon: "✅",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      icon: "🎉",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      label: "Total Spent",
      value: `$${payments
        .filter((p) => p.status === "success")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
        .toLocaleString()}`,
      icon: "💰",
      gradient: "from-orange-600 to-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-6"></div>
          <p className="text-white text-2xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-5xl font-bold text-white mb-4">
                Welcome back, {user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-xl text-gray-300">
                Here's an overview of your property bookings and activities
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 hover-glow"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-4xl mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/properties" className="btn-secondary text-center py-6">
              🏠 Browse Properties
            </Link>
            <Link href="/profile" className="btn-secondary text-center py-6">
              👤 Edit Profile
            </Link>
            <Link href="/contact" className="btn-secondary text-center py-6">
              💬 Contact Support
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="glass-card p-2 mb-8 flex space-x-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "bookings"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            📅 My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "payments"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            💳 Payment History ({payments.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "bookings" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {bookings.length === 0 ? (
              <div className="glass-card p-20 text-center">
                <div className="text-8xl mb-6">📅</div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  No Bookings Yet
                </h3>
                <p className="text-gray-300 text-xl mb-8">
                  Start exploring our luxury properties and book your first
                  viewing
                </p>
                <Link href="/properties" className="btn-primary inline-block">
                  Explore Properties
                </Link>
              </div>
            ) : (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 hover-glow"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <span
                          className={`badge ${getStatusBadge(booking.status)}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          Booked on{" "}
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold text-white mb-3">
                        {booking.property.name}
                      </h3>

                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-center">
                          <span className="w-6 mr-2">📍</span>
                          {booking.property.location}
                        </p>
                        <p className="flex items-center">
                          <span className="w-6 mr-2">📅</span>
                          Visit:{" "}
                          {new Date(booking.visit_date).toLocaleDateString()}
                          {booking.visit_time && ` at ${booking.visit_time}`}
                        </p>
                        <p className="flex items-center">
                          <span className="w-6 mr-2">💰</span>
                          Total: $
                          {parseFloat(booking.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end space-y-3">
                      <div className="text-right">
                        <div className="text-gray-400 text-sm mb-1">
                          Booking ID
                        </div>
                        <div className="text-white font-mono text-sm">
                          {booking.id.substring(0, 8).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {booking.status === "pending" && (
                          <Link
                            href={`/checkout/${booking.id}`}
                            className="btn-primary px-8 py-3 text-center whitespace-nowrap"
                          >
                            💳 Pay Now
                          </Link>
                        )}

                        <Link
                          href={`/properties/${booking.property.slug}`}
                          className="btn-secondary px-8 py-3 text-center whitespace-nowrap"
                        >
                          👁️ View Property
                        </Link>

                        {["pending", "paid"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                          >
                            ❌ Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-hidden"
          >
            {payments.length === 0 ? (
              <div className="p-20 text-center">
                <div className="text-8xl mb-6">💳</div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  No Payments Yet
                </h3>
                <p className="text-gray-300 text-xl">
                  Your payment history will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Provider
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">
                          {payment.booking.property.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-400">
                            {payment.transaction_id.substring(0, 12)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-gray-300">
                            {payment.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          ${parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${getStatusBadge(
                              payment.status
                            )}`}
                          >
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
