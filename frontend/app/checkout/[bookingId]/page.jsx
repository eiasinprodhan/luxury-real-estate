"use client";

import useAuthStore from "@/store/authStore";
import { bookingsAPI, paymentsAPI } from "@/utils/api";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Stripe Checkout Form Component
function StripeCheckoutForm({ booking, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?booking_id=${booking.id}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("Payment failed. Please try again.");
      onError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
      >
        {loading ? (
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
            Processing Payment...
          </>
        ) : (
          <>💳 Pay ${parseFloat(booking.total_amount || 0).toLocaleString()}</>
        )}
      </button>
    </form>
  );
}

// Main Checkout Component
export default function Checkout() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bkashLoading, setBkashLoading] = useState(false);

  const bookingId = params?.bookingId;

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      router.push(`/login?redirect=/checkout/${bookingId}`);
    }
  }, [isAuthenticated, bookingId, router]);

  // Load booking
  useEffect(() => {
    if (bookingId && isAuthenticated) {
      loadBooking();
    }
  }, [bookingId, isAuthenticated]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getOne(bookingId);
      console.log("Booking loaded:", response.data);
      setBooking(response.data);

      // Check if already paid
      if (response.data.payment_status === "paid") {
        toast.success("This booking is already paid!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error loading booking:", error);
      toast.error("Failed to load booking details");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Stripe Payment
  const initializeStripePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await paymentsAPI.create({
        booking_id: booking.id,
        provider: "stripe",
        currency: "USD",
      });

      console.log("Stripe payment initialized:", response.data);

      if (response.data.client_secret) {
        setClientSecret(response.data.client_secret);
      } else {
        throw new Error("No client secret received");
      }
    } catch (error) {
      console.error("Stripe initialization error:", error);
      toast.error(
        error.response?.data?.error || "Failed to initialize payment"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Initialize bKash Payment
  const initializeBkashPayment = async () => {
    setBkashLoading(true);
    try {
      const response = await paymentsAPI.initiateBkash({
        booking_id: booking.id,
        currency: "BDT",
      });

      console.log("bKash payment initialized:", response.data);

      if (response.data.bkash_url) {
        // Open bKash payment page in new window
        window.open(response.data.bkash_url, "_blank");
        toast.success("bKash payment window opened!");
      } else {
        throw new Error("No bKash URL received");
      }
    } catch (error) {
      console.error("bKash initialization error:", error);
      toast.error(
        error.response?.data?.error || "Failed to initialize bKash payment"
      );
    } finally {
      setBkashLoading(false);
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setClientSecret(""); // Reset client secret when changing method
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Confirm payment on backend
      await paymentsAPI.confirmStripe({
        payment_intent_id: paymentIntent.id,
        booking_id: booking.id,
      });

      toast.success("Payment successful!");
      router.push(`/payment-success?booking_id=${booking.id}`);
    } catch (error) {
      console.error("Error confirming payment:", error);
      // Still redirect to success as Stripe has confirmed
      router.push(`/payment-success?booking_id=${booking.id}`);
    }
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    toast.error(errorMessage);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex space-x-2 justify-center mb-6">
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"></div>
          </div>
          <p className="text-white text-2xl">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // No booking state
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Booking Not Found
          </h2>
          <p className="text-gray-300 mb-6">
            We couldn&apos;t find this booking. It may have been cancelled or
            doesn&apos;t exist.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Stripe Elements options
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#7c3aed",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "12px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Secure Checkout 🔒
          </h1>
          <p className="text-gray-300 text-lg">
            Complete your booking payment securely
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Booking Details Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">📋</span>
                Booking Summary
              </h2>

              {/* Property Info */}
              <div className="bg-white/5 rounded-2xl p-4 md:p-6 mb-6">
                <div className="flex gap-4">
                  {booking.property?.featured_image ? (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={booking.property.featured_image}
                        alt={booking.property.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {booking.property?.name || "Property"}
                    </h3>
                    <p className="text-gray-300 flex items-center">
                      <span className="mr-2">📍</span>
                      {booking.property?.location || "Location"}
                    </p>
                    {booking.property?.bedrooms && (
                      <p className="text-gray-400 text-sm mt-2">
                        🛏️ {booking.property.bedrooms} beds • 🚿{" "}
                        {booking.property.bathrooms} baths
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    📅 Visit Date
                  </div>
                  <div className="text-white font-semibold">
                    {booking.visit_date
                      ? new Date(booking.visit_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "TBD"}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    🕐 Visit Time
                  </div>
                  <div className="text-white font-semibold">
                    {booking.visit_time || "10:00 AM"}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-6"></div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Booking Fee</span>
                  <span>
                    $
                    {parseFloat(
                      booking.base_amount || booking.total_amount || 0
                    ).toLocaleString()}
                  </span>
                </div>
                {booking.service_fee && parseFloat(booking.service_fee) > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Service Fee</span>
                    <span>
                      ${parseFloat(booking.service_fee).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.tax_amount && parseFloat(booking.tax_amount) > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>
                      ${parseFloat(booking.tax_amount).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between text-xl md:text-2xl font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      ${parseFloat(booking.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔒</span>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    Secure Payment
                  </div>
                  <div className="text-gray-400 text-sm">
                    256-bit SSL encryption protects your payment
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <Link
              href={`/properties/${booking.property?.slug || ""}`}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Back to Property
            </Link>
          </motion.div>

          {/* Right Column - Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">💳</span>
                Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
                {/* Stripe Option */}
                <button
                  onClick={() => handlePaymentMethodSelect("stripe")}
                  className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === "stripe"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">
                          Credit/Debit Card
                        </div>
                        <div className="text-gray-400 text-sm">
                          Visa, Mastercard, Amex • Powered by Stripe
                        </div>
                      </div>
                    </div>
                    {paymentMethod === "stripe" && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
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
                    )}
                  </div>
                </button>

                {/* bKash Option */}
                <button
                  onClick={() => handlePaymentMethodSelect("bkash")}
                  className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === "bkash"
                      ? "border-pink-500 bg-pink-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">
                          bKash
                        </div>
                        <div className="text-gray-400 text-sm">
                          Mobile Banking Payment (Bangladesh)
                        </div>
                      </div>
                    </div>
                    {paymentMethod === "bkash" && (
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
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
                    )}
                  </div>
                </button>
              </div>

              {/* Stripe Payment Form */}
              {paymentMethod === "stripe" && (
                <div className="space-y-4">
                  {!clientSecret ? (
                    <button
                      onClick={initializeStripePayment}
                      disabled={paymentLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                      {paymentLoading ? (
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
                          Initializing...
                        </>
                      ) : (
                        "Continue to Card Payment →"
                      )}
                    </button>
                  ) : (
                    <Elements stripe={stripePromise} options={stripeOptions}>
                      <StripeCheckoutForm
                        booking={booking}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>
                  )}
                </div>
              )}

              {/* bKash Payment */}
              {paymentMethod === "bkash" && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-semibold mb-2">
                      How bKash Payment Works:
                    </h4>
                    <ol className="text-gray-400 text-sm space-y-2">
                      <li>1. Click the button below to open bKash payment</li>
                      <li>2. Enter your bKash number and PIN</li>
                      <li>3. Confirm the payment</li>
                      <li>4. Return to this page after payment</li>
                    </ol>
                  </div>

                  <button
                    onClick={initializeBkashPayment}
                    disabled={bkashLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                  >
                    {bkashLoading ? (
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
                        Opening bKash...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📱</span>
                        Pay with bKash
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Accepted Cards */}
              {paymentMethod === "stripe" && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-3">Accepted Cards:</p>
                  <div className="flex gap-3">
                    <div className="bg-white rounded-lg px-3 py-2 text-sm font-bold text-blue-600">
                      VISA
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm font-bold text-red-500">
                      Mastercard
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm font-bold text-blue-500">
                      Amex
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Having trouble?{" "}
                <Link
                  href="/contact"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
