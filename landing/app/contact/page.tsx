"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, ArrowRight, Shield, Check, Loader2 } from "lucide-react";
import Link from "next/link";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqeraveb";

export default function ContactPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main>
      {/* Nav bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-base/80 backdrop-blur-xl border-b border-gray-200 dark:border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-serif italic text-lg text-black dark:text-ink">Botlock</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-inkMuted hover:text-black dark:hover:text-ink transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-16">
        <div className="w-full max-w-xl">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="section-label">Contact Sales</span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-serif italic font-normal text-black dark:text-ink tracking-tight">
              Let&apos;s talk about monetizing your content
            </h1>
            <p className="mt-4 text-gray-600 dark:text-inkMuted max-w-md mx-auto leading-relaxed">
              Whether you&apos;re a publisher, a platform, or an AI company — we&apos;ll help you integrate Botlock and start earning from AI agent access.
            </p>
          </motion.div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-8 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-black dark:text-ink mb-2">Message sent!</h2>
              <p className="text-sm text-gray-600 dark:text-inkMuted mb-6">
                Thanks for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to home
              </Link>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-8 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-black dark:text-ink mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-600 dark:text-inkMuted mb-4">
                Please try again or email us directly:
              </p>
              <a
                href="mailto:guptavedant847@gmail.com"
                className="inline-flex items-center gap-2 text-accent font-medium text-sm hover:underline mb-4"
              >
                <Mail className="w-4 h-4" />
                guptavedant847@gmail.com
              </a>
              <div>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm text-gray-500 dark:text-inkSubtle hover:text-black dark:hover:text-ink transition-colors"
                >
                  ← Back to form
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-surface p-6 sm:p-8 space-y-5"
            >
              {/* Formspree hidden fields for email formatting */}
              <input type="hidden" name="_subject" value="New Botlock Sales Inquiry" />
              <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-inkSubtle mb-2 uppercase tracking-wider">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-raised border border-gray-200 dark:border-border text-black dark:text-ink text-sm placeholder:text-gray-400 dark:placeholder:text-inkSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-inkSubtle mb-2 uppercase tracking-wider">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane@company.com"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-raised border border-gray-200 dark:border-border text-black dark:text-ink text-sm placeholder:text-gray-400 dark:placeholder:text-inkSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-inkSubtle mb-2 uppercase tracking-wider">
                  Company <span className="text-gray-400 dark:text-inkSubtle normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="Acme Media Inc."
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-raised border border-gray-200 dark:border-border text-black dark:text-ink text-sm placeholder:text-gray-400 dark:placeholder:text-inkSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-inkSubtle mb-2 uppercase tracking-wider">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your site, traffic volume, and what you'd like to gate..."
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-raised border border-gray-200 dark:border-border text-black dark:text-ink text-sm placeholder:text-gray-400 dark:placeholder:text-inkSubtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-black font-semibold px-6 py-3.5 rounded-lg transition-colors text-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-inkSubtle">
                We&apos;ll respond to your email within 24 hours.
              </p>
            </motion.form>
          )}

          {/* Direct email fallback */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-inkSubtle"
          >
            <Mail className="w-4 h-4" />
            <span>Or email us directly at</span>
            <a
              href="mailto:guptavedant847@gmail.com"
              className="text-accent font-medium hover:underline"
            >
              guptavedant847@gmail.com
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
