"use client";

import { motion } from "framer-motion";

export default function About() {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "👩‍💼",
      bio: "15+ years in luxury real estate",
    },
    {
      name: "Michael Chen",
      role: "Head of Sales",
      image: "👨‍💼",
      bio: "Closed over $500M in deals",
    },
    {
      name: "Emily Rodriguez",
      role: "Chief Architect",
      image: "👩‍🎨",
      bio: "Award-winning designer",
    },
    {
      name: "David Kim",
      role: "Technology Director",
      image: "👨‍💻",
      bio: "Innovation specialist",
    },
  ];

  const milestones = [
    { year: "2015", event: "Company Founded", icon: "🚀" },
    { year: "2017", event: "100+ Properties Listed", icon: "🏠" },
    { year: "2019", event: "International Expansion", icon: "🌍" },
    { year: "2021", event: "$1B in Sales", icon: "💰" },
    { year: "2023", event: "Tech Innovation Award", icon: "🏆" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Excellence",
      description: "We strive for perfection in every detail of our service",
    },
    {
      icon: "🤝",
      title: "Integrity",
      description: "Honest and transparent in all our dealings",
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "Leading the industry with cutting-edge technology",
    },
    {
      icon: "❤️",
      title: "Client-Focused",
      description: "Your satisfaction is our top priority",
    },
  ];

  const stats = [
    { value: "500+", label: "Luxury Properties", icon: "🏘️" },
    { value: "1000+", label: "Happy Clients", icon: "😊" },
    { value: "50+", label: "Industry Awards", icon: "🏆" },
    { value: "25+", label: "Global Cities", icon: "🌆" },
  ];

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
            className="text-center"
          >
            <h1 className="text-7xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">LuxuryEstate</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to revolutionize luxury real estate by
              combining exceptional properties with cutting-edge technology and
              unparalleled customer service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Founded in 2015, LuxuryEstate was born from a simple vision:
                  to make luxury real estate accessible, transparent, and
                  technology-driven.
                </p>
                <p>
                  Our founders, with over 50 years of combined experience in
                  real estate and technology, saw an opportunity to transform
                  how people discover and purchase their dream properties.
                </p>
                <p>
                  Today, we're proud to be one of the leading luxury real estate
                  platforms, serving clients across 25+ cities worldwide with a
                  portfolio of over 500 exclusive properties.
                </p>
                <p>
                  Our commitment to excellence, innovation, and client
                  satisfaction has earned us numerous industry awards and the
                  trust of thousands of satisfied clients.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/80 backdrop-blur-lg border border-blue-100 p-8 h-[600px] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center rounded-3xl shadow-xl shadow-blue-500/10">
                <div className="text-center">
                  <div className="text-9xl mb-8">🏰</div>
                  <p className="text-2xl text-gray-900 font-semibold">
                    Building Dreams Since 2015
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-5xl mb-6">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our growth story
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative mb-12 last:mb-0"
              >
                <div className="bg-white/80 backdrop-blur-lg border border-blue-100 rounded-2xl p-8 flex items-center space-x-6 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-blue-600 font-bold text-2xl mb-2">
                      {milestone.year}
                    </div>
                    <div className="text-gray-900 text-xl font-semibold">
                      {milestone.event}
                    </div>
                  </div>
                </div>
                {index < milestones.length - 1 && (
                  <div className="absolute left-10 top-full h-12 w-1 bg-blue-600 ml-9"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate professionals dedicated to your success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
              >
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-semibold mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of satisfied clients who found their dream
              properties with us
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/properties"
                className="bg-white text-blue-600 px-12 py-6 rounded-xl font-semibold text-xl hover:bg-gray-100 transition-all duration-300"
              >
                Explore Properties
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-12 py-6 rounded-xl font-semibold text-xl hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
