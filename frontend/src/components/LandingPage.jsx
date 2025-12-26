import { Github, Linkedin, Globe } from "lucide-react";
import bgImg from "../assets/lifestyle-bg.png";

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mt-50">
        
        {/* Primary CTA */}
        <div className="mt-50">
          <a
            href="https://spur-assist.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-block
              bg-amber-500 hover:bg-amber-600
              text-black font-medium
              px-10 py-3 rounded-full
              shadow-lg transition-transform
              hover:scale-105
            "
          >
            View Updates
          </a>
        </div>

        {/* Social Icons */}
        <div className="mt-8 flex justify-center gap-6">
          <a
            href="https://github.com/naman-ptdr"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition"
          >
            <Github size={22} />
          </a>

          <a
            href="https://www.linkedin.com/in/naman-patidar/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition"
          >
            <Linkedin size={22} />
          </a>

          <a
            href="https://naman-ptdr.github.io/MY-PORTFOLIO/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 transition"
          >
            <Globe size={22} />
          </a>
        </div>
      </div>
    </div>
  );
}
