"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import dynamic from "next/dynamic";

// Dynamic import for the 3D scene (ssr: false, zero impact on initial load)
const DeveloperDesk3D = dynamic(
  () => import("@/components/DeveloperDesk3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[520px] rounded-[24px] border border-emerald-500/20 bg-[#04140f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-emerald-500/30 border-t-[#10B981] animate-spin" />
          <span className="text-xs text-emerald-200/60 font-mono">Loading 3D workspace...</span>
        </div>
      </div>
    ),
  }
);

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    honeypot: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // WebGL support detection
  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  });

  // IntersectionObserver to only mount 3D scene when scrolled near viewport
  const [isNearViewport, setIsNearViewport] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setStatusMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusMessage(data.message || "Thank you! Your message has been sent successfully.");
        // Clear form on success
        setFormData({ name: "", email: "", message: "", honeypot: "" });
      } else {
        setStatus("error");
        setStatusMessage(data.error || "Failed to send message. Please try again later.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact Section"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 2xl:py-36 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 bg-[#04140D] bg-[image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] text-white selection:bg-[#10B981] selection:text-black overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Centered Top Badge & Heading */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-950/80 bg-[#061711] text-xs sm:text-sm text-emerald-200/90 font-medium mb-3 shadow-inner shadow-black/40">
            <span>Have questions or ideas? Let’s talk! 🚀</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            Get in Touch – Let’s Connect
          </h2>
        </div>

        {/* Two-Column Grid: Form (Left) & 3D Desk (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-stretch">
          {/* Left Column: Contact Form */}
          <div className="rounded-2xl 2xl:rounded-3xl border border-emerald-950/60 bg-[#061711]/75 backdrop-blur-md p-6 sm:p-8 lg:p-10 flex flex-col justify-between shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 flex-1 justify-between">
              {/* Bot Honeypot (visually hidden, tabIndex -1) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                />
              </div>

              {/* Your name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-name"
                  className="text-xs sm:text-sm font-semibold text-emerald-100/90"
                >
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="What’s your good name?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-emerald-950/70 bg-[#081a14]/90 px-4 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
                />
              </div>

              {/* Your Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-email"
                  className="text-xs sm:text-sm font-semibold text-emerald-100/90"
                >
                  Your Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="What’s your email address?"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-emerald-950/70 bg-[#081a14]/90 px-4 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
                />
              </div>

              {/* Your Message */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-message"
                  className="text-xs sm:text-sm font-semibold text-emerald-100/90"
                >
                  Your Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  placeholder="How can I help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-y rounded-xl border border-emerald-950/70 bg-[#081a14]/90 px-4 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all min-h-[140px]"
                />
              </div>

              {/* Feedback Status Announcements */}
              {statusMessage && (
                <div
                  aria-live="polite"
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
                    status === "success"
                      ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-300"
                      : "bg-red-950/60 border border-red-500/50 text-red-300"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#10B981] text-[#03150e] font-bold text-sm sm:text-base tracking-wider uppercase hover:bg-[#188a61] hover:text-white hover:scale-[1.01] transition-all duration-300 shadow-md shadow-[#10B981]/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                {status === "sending" ? "Sending…" : "SEND MESSAGE"}
              </button>
            </form>
          </div>

          {/* Right Column: 3D Developer Desk Scene */}
          <div
            ref={panelRef}
            className="w-full h-full min-h-[520px] relative flex flex-col"
          >
            {isNearViewport && webGLSupported ? (
              <DeveloperDesk3D />
            ) : !webGLSupported ? (
              /* WebGL unavailable fallback */
              <div className="w-full h-full min-h-[520px] rounded-[24px] border border-emerald-500/20 bg-[#04140f] flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="size-12 rounded-xl bg-[#081a14] border border-emerald-950/80 flex items-center justify-center text-2xl">
                  💻
                </div>
                <h3 className="font-bold text-lg text-white">Developer Workspace</h3>
                <p className="text-xs sm:text-sm text-emerald-100/60 max-w-xs leading-relaxed">
                  Interactive 3D preview requires WebGL support. Feel free to leave a message using the form!
                </p>
              </div>
            ) : (
              /* Lightweight placeholder before scrolling into view */
              <div className="w-full h-full min-h-[520px] rounded-[24px] border border-emerald-500/20 bg-[#04140f] flex items-center justify-center">
                <div className="size-6 rounded-full border-2 border-emerald-500/20 border-t-[#10B981] animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
