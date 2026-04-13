"use client";

import { Footer } from "@/components/layout/footer";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { useState } from "react";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@portfoliou.urbantrends.dev",
    href: "mailto:hello@portfoliou.urbantrends.dev",
    description: "Best for general enquiries and partnership requests.",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nairobi, Kenya",
    href: null,
    description: "We are based in Nairobi and building for East Africa first.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would POST to an API endpoint or email service.
    // For now, show a success state.
    setSubmitted(true);
  }

  return (
    <>
      <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-950 py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-gray-300 text-lg">
              Whether you are a student, a business, an investor, or just
              curious — we would love to hear from you.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-5">
                  {contactMethods.map((method) => (
                    <div key={method.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                        <method.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                          {method.label}
                        </p>
                        {method.href ? (
                          <a
                            href={method.href}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {method.value}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  For Partnerships & Investors
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  We are actively seeking partnerships with universities,
                  creative agencies, and businesses in East Africa. If you are
                  interested in collaborating or investing, email us at{" "}
                  <a
                    href="mailto:partnerships@portfoliou.urbantrends.dev"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    partnerships@portfoliou.urbantrends.dev
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mb-4">
                    <MessageSquare className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Message Received!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Thanks for reaching out. We will get back to you within 1–2
                    business days.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Send a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Your name"
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="you@email.com"
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        placeholder="What is this about?"
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Tell us what's on your mind..."
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
