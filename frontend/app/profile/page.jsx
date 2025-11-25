"use client";

import useAuthStore from "@/store/authStore";
import { authAPI } from "@/utils/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl"
            >
              {user?.username?.charAt(0).toUpperCase()}
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-xl text-gray-300">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Form */}
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="mr-3">📝</span>
              Personal Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2 font-semibold">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Saving Changes..." : "💾 Save Changes"}
              </button>
            </form>
          </div>

          {/* Account Details */}
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="mr-3">ℹ️</span>
              Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-2xl">
                <div className="text-gray-400 mb-2">Username</div>
                <div className="text-2xl font-bold text-white">
                  {user?.username}
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl">
                <div className="text-gray-400 mb-2">Account Type</div>
                <div className="text-2xl font-bold text-white capitalize">
                  {user?.user_type}
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl">
                <div className="text-gray-400 mb-2">Member Since</div>
                <div className="text-2xl font-bold text-white">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl">
                <div className="text-gray-400 mb-2">Account Status</div>
                <div className="text-2xl font-bold text-green-400">
                  Active ✓
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="mr-3">🔒</span>
              Security Settings
            </h2>

            <div className="space-y-4">
              <button className="w-full btn-secondary text-left flex justify-between items-center">
                <span>Change Password</span>
                <span>→</span>
              </button>

              <button className="w-full btn-secondary text-left flex justify-between items-center">
                <span>Two-Factor Authentication</span>
                <span className="badge badge-warning">Coming Soon</span>
              </button>

              <button className="w-full btn-secondary text-left flex justify-between items-center">
                <span>Login History</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
