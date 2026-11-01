import Image from "next/image";
import ProfileImg2 from "./assets/ProfileImg2.jpeg";
import { ChatDots, Download, WhatsappFill, Plus } from "akar-icons";
import ExperienceSection from "@/components/ExperienceSection";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#04140D] text-white overflow-x-hidden selection:bg-[#10B981] selection:text-black">
      {/* Hero Section */}
      <section
        aria-label="Hero Section"
        className="min-h-screen w-full flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 2xl:p-24 bg-[image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"
      >
        <div className="w-full max-w-7xl 2xl:max-w-[1600px] flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-10 sm:gap-12 md:gap-10 lg:gap-14 xl:gap-20 2xl:gap-28 py-8 sm:py-12 md:py-16">
          {/* Left Text / Info Column */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-7 items-center text-center md:items-start md:text-left flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold text-white tracking-tight leading-[1.08]">
              Muhammad Masood Sheikh
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-[#34D399] tracking-tight">
              MERN Stack Developer
            </h2>
            <div className="w-36 sm:w-48 md:w-60 lg:w-72 xl:w-88 2xl:w-[420px] h-1 md:h-1.5 2xl:h-2 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full" />
            <p className="text-white font-sans text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-[26px] font-extralight leading-relaxed max-w-xl lg:max-w-2xl xl:max-w-3xl">
              I contribute in making of interactive and engaging web and mobile applications.
              Grateful for the engineering concepts that help me build clean, efficient, and optimal solutions.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 lg:gap-5 xl:gap-6 mt-2 xl:mt-4">
              <button
                type="button"
                className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 xl:px-8 xl:py-4 bg-[#10B981] font-bold rounded-xl border-none text-sm sm:text-base lg:text-lg xl:text-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#188a61] hover:scale-105 transition-all duration-300 shadow-md shadow-[#10B981]/25"
              >
                <ChatDots className="size-4 sm:size-5 xl:size-6" />
                Contact me
              </button>
              <a
                href="/documents/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="border px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 xl:px-8 xl:py-4 border-[#10B981] rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl hover:bg-[#188a61] hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <Download className="size-4 sm:size-5 xl:size-6" />
                Download Resume
              </a>
              <a
                href="https://wa.me/923323139837"
                target="_blank"
                rel="noopener noreferrer"
                className="border px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 xl:px-8 xl:py-4 border-[#10B981] rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl hover:bg-[#25D366] hover:text-white hover:border-transparent hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <WhatsappFill className="size-4 sm:size-5 xl:size-6" />
                Whatsapp
              </a>
            </div>

            <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl justify-between mt-4 md:mt-6 xl:mt-8 text-left">
              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold flex items-center text-white">
                  5 <Plus className="size-5 sm:size-6 lg:size-7 xl:size-8" />
                </h3>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-zinc-300 mt-1">Months Experience</p>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold flex items-center text-white">
                  10 <Plus className="size-5 sm:size-6 lg:size-7 xl:size-8" />
                </h3>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-zinc-300 mt-1">Projects completed</p>
              </div>
            </div>
          </div>

          {/* Right Image Column with Floating Badges */}
          <div className="relative shrink-0 flex items-center justify-center mt-6 md:mt-0">
            {/* Top-right badge */}
            <div className="absolute -top-2 -right-2 sm:top-2 sm:right-2 lg:top-4 lg:right-4 xl:top-6 xl:right-6 bg-gray-900/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3 rounded-xl animate-[float_3s_ease-in-out_infinite] border border-emerald-950/40 shadow-lg shadow-black/40 z-10">
              <p className="text-[11px] sm:text-xs lg:text-sm xl:text-base text-gray-300 font-medium">Specialized in</p>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-[#34D399] font-bold">React &amp; Node.js</p>
            </div>

            {/* Bottom-left badge */}
            <div className="absolute -bottom-2 -left-2 sm:bottom-2 sm:left-2 lg:bottom-4 lg:left-4 xl:bottom-6 xl:left-6 bg-gray-900/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 xl:px-6 xl:py-3 rounded-xl animate-[float_3s_ease-in-out_infinite] [animation-delay:1.5s] border border-emerald-950/40 shadow-lg shadow-black/40 z-10">
              <p className="text-[11px] sm:text-xs lg:text-sm xl:text-base text-gray-300 font-medium">Based in</p>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-[#34D399] font-bold">Karachi, Pakistan</p>
            </div>

            <Image
              src={ProfileImg2}
              alt="Muhammad Masood Sheikh"
              priority
              className="w-56 h-56 sm:w-68 sm:h-68 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] xl:w-[500px] xl:h-[500px] 2xl:w-[580px] 2xl:h-[580px] object-cover rounded-full shadow-2xl shadow-[#18805d]/40 ring-4 ring-emerald-500/20"
            />
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <ExperienceSection />

      {/* Footer */}
      <footer className="py-8 sm:py-10 md:py-12 xl:py-14 text-center text-xs sm:text-sm xl:text-base text-zinc-500 border-t border-emerald-950/40 bg-[#04140D]">
        <p>© 2026 Muhammad Masood Sheikh. Built with React.</p>
      </footer>
    </main>
  );
}
