"use client";

import api from "@/utils/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get("/bookings/");
      setBookings(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bookings Management
        </h1>
        <p className="text-gray-600">View and manage all property bookings</p>
      </div>

      {/* Filter */}
      <div className="glass-card p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {["pending", "paid", "completed", "canceled"].map((status) => (
          <div key={status} className="glass-card p-6">
            <p className="text-gray-600 text-sm mb-1 capitalize">{status}</p>
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Property</th>
                <th>Visit Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-mono text-xs">
                    {booking.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="text-gray-900">{booking.user?.username}</td>
                  <td className="text-gray-700">{booking.property?.name}</td>
                  <td className="text-gray-700">
                    {new Date(booking.visit_date).toLocaleDateString()}
                  </td>
                  <td className="font-semibold text-gray-900">
                    ${parseFloat(booking.total_amount).toLocaleString()}
                  </td>
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
                  <td className="text-gray-600 text-sm">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
