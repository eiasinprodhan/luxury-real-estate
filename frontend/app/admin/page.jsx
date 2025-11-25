"use client";

import api from "@/utils/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    bookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [propertiesRes, usersRes, bookingsRes, paymentsRes] =
        await Promise.all([
          api.get("/properties/"),
          api.get("/users/"),
          api.get("/bookings/"),
          api.get("/payments/"),
        ]);

      const properties = propertiesRes.data.results || propertiesRes.data;
      const users = usersRes.data.results || usersRes.data;
      const bookings = bookingsRes.data.results || bookingsRes.data;
      const payments = paymentsRes.data.results || paymentsRes.data;

      const revenue = payments
        .filter((p) => p.status === "success")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      setStats({
        properties: properties.length,
        users: users.length,
        bookings: bookings.length,
        revenue: revenue,
      });

      // Recent activity (last 5 bookings)
      setRecentActivity(bookings.slice(0, 5));
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Properties",
      value: stats.properties,
      icon: "🏘️",
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: "👥",
      color: "bg-green-500",
      change: "+8%",
    },
    {
      label: "Total Bookings",
      value: stats.bookings,
      icon: "📅",
      color: "bg-purple-500",
      change: "+23%",
    },
    {
      label: "Total Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: "💰",
      color: "bg-orange-500",
      change: "+15%",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-semibold text-green-600">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
          <a
            href="/admin/bookings"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Property</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-mono text-xs">
                    {booking.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td>{booking.user?.username}</td>
                  <td>{booking.property?.name}</td>
                  <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === "paid"
                          ? "badge-success"
                          : booking.status === "pending"
                          ? "badge-warning"
                          : booking.status === "canceled"
                          ? "badge-danger"
                          : "badge-info"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="font-semibold text-gray-900">
                    ${parseFloat(booking.total_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            ➕
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Add Property</h3>
          <p className="text-gray-600 text-sm">Create a new property listing</p>
        </div>

        <div className="glass-card p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            👥
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-gray-600 text-sm">View and manage user accounts</p>
        </div>

        <div className="glass-card p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            📊
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">View Reports</h3>
          <p className="text-gray-600 text-sm">Access detailed analytics</p>
        </div>
      </div>
    </div>
  );
}
