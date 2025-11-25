"use client";

import api from "@/utils/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.get("/properties/");
      setProperties(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await api.delete(`/properties/${slug}/`);
      toast.success("Property deleted successfully");
      loadProperties();
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Properties Management
          </h1>
          <p className="text-gray-600">Manage all property listings</p>
        </div>
        <button
          onClick={() => {
            setEditingProperty(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          ➕ Add New Property
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Properties Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Price</th>
                <th>Beds/Baths</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏠</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {property.name}
                        </p>
                        <p className="text-xs text-gray-500">{property.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-700">{property.location}</td>
                  <td className="font-semibold text-gray-900">
                    ${parseFloat(property.price).toLocaleString()}
                  </td>
                  <td className="text-gray-700">
                    {property.bedrooms} / {property.bathrooms}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        property.status === "active"
                          ? "badge-success"
                          : property.status === "sold"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="text-gray-600 text-sm">
                    {new Date(property.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProperty(property);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property.slug)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PropertyModal
          property={editingProperty}
          onClose={() => {
            setShowModal(false);
            setEditingProperty(null);
          }}
          onSuccess={() => {
            loadProperties();
            setShowModal(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}

// Property Modal Component
function PropertyModal({ property, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: property?.name || "",
    description: property?.description || "",
    location: property?.location || "",
    price: property?.price || "",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    square_feet: property?.square_feet || "",
    status: property?.status || "active",
    amenities: Array.isArray(property?.amenities)
      ? property.amenities.join(", ")
      : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        amenities: formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
      };

      if (property) {
        await api.patch(`/properties/${property.slug}/`, data);
        toast.success("Property updated successfully");
      } else {
        await api.post("/properties/", data);
        toast.success("Property created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? "Edit Property" : "Add New Property"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Property Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                placeholder="Luxury Beachfront Villa"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input-field"
                placeholder="Miami, Florida"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Price *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="input-field"
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Square Feet
              </label>
              <input
                type="number"
                value={formData.square_feet}
                onChange={(e) =>
                  setFormData({ ...formData, square_feet: e.target.value })
                }
                className="input-field"
                placeholder="6500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Bedrooms *
              </label>
              <input
                type="number"
                required
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                className="input-field"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Bathrooms *
              </label>
              <input
                type="number"
                required
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                className="input-field"
                placeholder="4"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) =>
                  setFormData({ ...formData, amenities: e.target.value })
                }
                className="input-field"
                placeholder="Pool, Garden, Garage, Gym"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field min-h-[150px]"
              placeholder="Describe the property..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Saving..."
                : property
                ? "Update Property"
                : "Create Property"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
