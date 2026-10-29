import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, ArrowUpRight, Lock, Eye, Database, Mail, Bell, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-x-hidden selection:bg-yellow-400 selection:text-gray-900">
      {/* Background Image with dark overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url(/auth-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/85 via-gray-900/90 to-gray-950/95 backdrop-blur-[2px]"></div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/60 border-b border-white/10 px-6 lg:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-0 group">
            <img src="/logo.png" alt="Prayanam Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            <span className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase font-display drop-shadow-sm">
              Prayanam
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold text-white border border-white/10 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-950/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-14 shadow-2xl"
        >
          {/* Header Title */}
          <div className="border-b border-white/10 pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield size={14} />
              <span>Trust & Transparency</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight font-display">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-400 font-medium">
              Last updated: October 2026 • Effective immediately
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10 text-gray-300 leading-relaxed font-normal text-sm md:text-base">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Globe className="text-yellow-400" size={20} />
                <h2>1. Introduction</h2>
              </div>
              <p>
                Welcome to <strong>Prayanam</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are dedicated to providing students and travelers with smart, AI-driven budget travel planning while safeguarding your personal information. This Privacy Policy describes how we collect, store, process, and protect your data when you visit our web application and use our itinerary, budgeting, and recommendation tools.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Eye className="text-yellow-400" size={20} />
                <h2>2. Information We Collect</h2>
              </div>
              <p>We only collect data necessary to provide and improve your travel planning experience:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>
                  <strong className="text-white">Account Details:</strong> When you register, we collect your name, email address, password (stored strictly as a cryptographic hash), and optional profile avatars.
                </li>
                <li>
                  <strong className="text-white">Travel Preferences & Itinerary Data:</strong> Trip dates, starting city, destination, total budget, student preference filters, and saved places.
                </li>
                <li>
                  <strong className="text-white">Chat & Assistant Interactions:</strong> Queries submitted to Prayanam AI assistant to curate contextual travel advice and custom day-wise plans.
                </li>
                <li>
                  <strong className="text-white">Technical & Usage Logs:</strong> Browser type, operating system, and anonymous interaction timestamps to maintain platform reliability.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Database className="text-yellow-400" size={20} />
                <h2>3. How We Use Your Data</h2>
              </div>
              <p>Your data is used solely to deliver high quality, personalized travel services:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Generating customized itineraries, cost distributions, and interactive roadmap views.</li>
                <li>Authenticating user sessions and safeguarding account security.</li>
                <li>Sending critical transactional communications (email verifications and password reset links).</li>
                <li>Continuously refining our budgeting algorithms and student-friendly destination recommendations.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Lock className="text-yellow-400" size={20} />
                <h2>4. Data Protection & Security</h2>
              </div>
              <p>
                We implement industry-standard technical measures to prevent unauthorized access or disclosure:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Passwords are hashed with Bcrypt using salted algorithms.</li>
                <li>API endpoints are authenticated with short-lived JSON Web Tokens (JWT).</li>
                <li>Database connections use TLS/SSL encrypted channels to MongoDB Atlas.</li>
                <li>We do not sell, rent, or trade your personal information to any third parties or advertisers.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Bell className="text-yellow-400" size={20} />
                <h2>5. Third-Party Integrations</h2>
              </div>
              <p>
                To provide comprehensive travel information, Prayanam works with trusted partners:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li><strong className="text-white">AI Services:</strong> Generative AI engines to construct intelligent day-by-day travel suggestions.</li>
                <li><strong className="text-white">Geocoding & Maps:</strong> OpenStreetMap Nominatim for accurate location coordinates and discovery within India.</li>
                <li><strong className="text-white">Email Delivery:</strong> Brevo / Nodemailer strictly for transactional account verification and recovery emails.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-lg md:text-xl">
                <Mail className="text-yellow-400" size={20} />
                <h2>6. Your Rights & Inquiries</h2>
              </div>
              <p>
                You retain complete control over your personal data. You may inspect, modify, or permanently delete your account and associated trip plans anytime via your Profile settings, or by reaching out to our privacy team.
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-300 font-medium">Have questions or privacy concerns?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Contact us at <span className="text-yellow-300">support@prayanam.com</span></p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <span>Return to Prayanam</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>

          </div>

          {/* Footer inside card */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Prayanam. All rights reserved.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <span>Back to Landing Page</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
