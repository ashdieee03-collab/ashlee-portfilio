"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  Code2,
  Droplets,
  ExternalLink,
  Mail,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react"
import ContactForm from "./ContactForm"

// Register GSAP ScrollTrigger only in browser environment to prevent SSR evaluation errors
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type ProjectItem = {
  id: string
  title: string
  description: string
  technologies: string[]
  thumbnail?: MediaItem | null
  repositoryUrl?: string | null
  demoUrl?: string | null
  visualStyle: "orbit" | "weather" | "gallery"
}

type CredentialItem = {
  id: string
  title: string
  issuer: string
  issuedAt: string
  credentialId?: string | null
  certificate: MediaItem
  certificateUrl?: string | null
  verificationUrl?: string | null
}

type MediaItem = {
  url: string
  alt: string
  width?: number
  height?: number
}

type CareerItem = {
  id: string
  type: "work" | "education" | "training"
  title: string
  organization: string
  location?: string | null
  startDate: string
  endDate?: string | null
  current?: boolean | null
  description: string
  highlights: string[]
}

type Props = {
  projects: ProjectItem[]
  credentials?: CredentialItem[]
  career: CareerItem[]
}

const skills = [
  {
    icon: Code2,
    title: "Front-End",
    description:
      "Interfaces that are responsive, accessible, and built to last.",
    items: ["React", "Next.js", "HTML & CSS"],
  },
  {
    icon: Sparkles,
    title: "Motion & interaction",
    description:
      "Purposeful animation systems that guide attention and add character.",
    items: ["GSAP", "ScrollTrigger", "SVG", "Micro-interactions"],
  },
  {
    icon: BookOpen,
    title: "Design & workflow",
    description:
      "A systems mindset from early concepts through polished delivery.",
    items: ["Figma", "Design systems", "Git & GitHub", "Responsive design", "Canvas & SVG graphics"],
  },
]

/**
 * Format date string (e.g. "2024-05-01T00:00:00.000Z") to "May 2024".
 *
 * NOTE: We explicitly specify `timeZone: "UTC"`. Without this, clients in timezones west of UTC
 * (e.g. UTC-5 in New York, UTC-8 in California) parse UTC midnight as the previous night,
 * causing an off-by-one month display (e.g. "Apr 2024" instead of "May 2024") and triggering
 * React SSR hydration mismatch errors.
 */
const formatDate = (value: string) => {
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/**
 * Ensure external URLs start with http:// or https:// to prevent browsers
 * from treating them as relative links (e.g. localhost:3000/github.com/...)
 */
const ensureExternalUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`

// GitHub icon component matching Lucide styling and stroke parameters
function GithubIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

// Facebook icon component matching Lucide styling and stroke parameters
function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// LinkedIn icon component matching Lucide styling and stroke parameters
function LinkedinIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Ashlee Rivera, back to top">
      <span className="brand-mark" aria-hidden="true">
        A
      </span>
      <span>Ashlee Nicol T. Rivera</span>
    </a>
  )
}

// Interactive Certificate Swipe Gallery for Motion Gallery project showcase (13 Certificates)
const certificateGalleryItems = [
  {
    id: "cert-1",
    title: "Information Technology Specialist",
    issuer: "Cor Jesu College",
    date: "2024",
    image: "/certificates/cert1.jpg",
    color: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
  },
  {
    id: "cert-2",
    title: "Front-End Web Development",
    issuer: "React & Next.js Certified",
    date: "2024",
    image: "/certificates/cert2.jpg",
    color: "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #c084fc 100%)",
  },
  {
    id: "cert-3",
    title: "Interactive UI & Motion Craft",
    issuer: "GSAP Animation Systems",
    date: "2024",
    image: "/certificates/cert3.jpg",
    color: "linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)",
  },
  {
    id: "cert-4",
    title: "Digital Art & Brand Design",
    issuer: "Visual Design Academy",
    date: "2023",
    image: "/certificates/cert4.jpg",
    color: "linear-gradient(135deg, #9d174d 0%, #ec4899 50%, #f472b6 100%)",
  },
  {
    id: "cert-5",
    title: "UI/UX & Design Systems Masterclass",
    issuer: "Figma Academy Professional",
    date: "2024",
    image: "/certificates/cert5.jpg",
    color: "linear-gradient(135deg, #831843 0%, #db2777 50%, #f472b6 100%)",
  },
  {
    id: "cert-6",
    title: "JavaScript Algorithms & Structures",
    issuer: "freeCodeCamp Certified",
    date: "2023",
    image: "/certificates/cert6.jpg",
    color: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fcd34d 100%)",
  },
  {
    id: "cert-7",
    title: "Responsive Web Architecture",
    issuer: "W3C Developer Network",
    date: "2023",
    image: "/certificates/cert7.jpg",
    color: "linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #5eead4 100%)",
  },
  {
    id: "cert-8",
    title: "Database Management & SQL",
    issuer: "Oracle Academy Programs",
    date: "2023",
    image: "/certificates/cert8.jpg",
    color: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #818cf8 100%)",
  },
  {
    id: "cert-9",
    title: "Networking Essentials & Protocols",
    issuer: "Cisco Networking Academy",
    date: "2023",
    image: "/certificates/cert9.jpg",
    color: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)",
  },
  {
    id: "cert-10",
    title: "Cloud Fundamentals & Deployment",
    issuer: "Cloud Computing Track",
    date: "2023",
    image: "/certificates/cert10.jpg",
    color: "linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #9ca3af 100%)",
  },
  {
    id: "cert-11",
    title: "Typography, Logo & Identity Craft",
    issuer: "Creative Visual Guild",
    date: "2022",
    image: "/certificates/cert11.jpg",
    color: "linear-gradient(135deg, #701a75 0%, #c026d3 50%, #f0abfc 100%)",
  },
  {
    id: "cert-12",
    title: "Git, GitHub & Collaborative DevOps",
    issuer: "GitHub Education Track",
    date: "2022",
    image: "/certificates/cert12.jpg",
    color: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #86efac 100%)",
  },
  {
    id: "cert-13",
    title: "Cybersecurity & Web Integrity",
    issuer: "Security Systems Essentials",
    date: "2022",
    image: "/certificates/cert13.jpg",
    color: "linear-gradient(135deg, #312e81 0%, #6366f1 50%, #a5b4fc 100%)",
  },
]

function CertificateSwipeGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const total = certificateGalleryItems.length

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 35) handleNext()
    else if (diff < -35) handlePrev()
    touchStartX.current = null
  }

  return (
    <div
      className="cert-gallery-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Interactive certificate swipe gallery"
    >
      <button
        type="button"
        className="gallery-nav-btn prev"
        onClick={(e) => {
          e.stopPropagation()
          handlePrev()
        }}
        aria-label="Previous certificate"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="cert-card-stack">
        {certificateGalleryItems.map((cert, index) => {
          const isCurrent = index === activeIndex
          const isPrev =
            index === (activeIndex === 0 ? total - 1 : activeIndex - 1)
          const isNext =
            index === (activeIndex === total - 1 ? 0 : activeIndex + 1)

          let styleClass = "cert-slide-hidden"
          let inlineStyle: React.CSSProperties = {}

          if (isCurrent) {
            styleClass = "cert-slide-active"
            inlineStyle = {
              transform: "translateX(0%) scale(1) rotate(0deg)",
              zIndex: 10,
              opacity: 1,
            }
          } else if (isPrev) {
            styleClass = "cert-slide-side"
            inlineStyle = {
              transform: "translateX(-20%) scale(0.9) rotate(-4deg)",
              zIndex: 5,
              opacity: 0.75,
              cursor: "pointer",
            }
          } else if (isNext) {
            styleClass = "cert-slide-side"
            inlineStyle = {
              transform: "translateX(20%) scale(0.9) rotate(4deg)",
              zIndex: 5,
              opacity: 0.75,
              cursor: "pointer",
            }
          }

          return (
            <div
              key={cert.id}
              className={`cert-slide ${styleClass}`}
              style={inlineStyle}
              onClick={() => {
                if (isPrev) handlePrev()
                if (isNext) handleNext()
              }}
            >
              <div className="cert-inner">
                {/* Real certificate image if available in public/certificates/ */}
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="cert-image-elem"
                  onError={(e) => {
                    // Gracefully hide broken image element if file not yet added to public/certificates/
                    e.currentTarget.style.display = "none"
                  }}
                />
                {/* Polished fallback certificate card design */}
                <div
                  className="cert-fallback-art"
                  style={{ background: cert.color }}
                >
                  <div className="cert-seal">
                    <Award size={26} />
                  </div>
                  <h4>{cert.title}</h4>
                  <p>{cert.issuer}</p>
                  <span>Verified · {cert.date}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="gallery-nav-btn next"
        onClick={(e) => {
          e.stopPropagation()
          handleNext()
        }}
        aria-label="Next certificate"
      >
        <ChevronRight size={18} />
      </button>

      <div className="gallery-footer-info">
        <div className="gallery-dots">
          {certificateGalleryItems.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-dot ${i === activeIndex ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex(i)
              }}
              aria-label={`Go to certificate ${i + 1}`}
            />
          ))}
        </div>
        <small className="gallery-counter">
          {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </small>
      </div>
    </div>
  )
}

function GsapMotionShowcase() {
  const [activePreset, setActivePreset] = useState<"logo" | "morph" | "orbit">("logo")
  const [speed, setSpeed] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const triggerAnimation = (preset: "logo" | "morph" | "orbit", spd: number) => {
    if (!stageRef.current) return
    if (timelineRef.current) timelineRef.current.kill()

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      timeScale: spd,
      onStart: () => setIsPlaying(true),
    })
    timelineRef.current = tl

    if (preset === "logo") {
      tl.set(".gsap-badge-node", { opacity: 1, scale: 1 })
      tl.fromTo(
        ".gsap-logo-path",
        { strokeDashoffset: 500, strokeDasharray: 500, opacity: 0.3 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.8, ease: "power2.inOut" },
      )
      tl.fromTo(
        ".gsap-logo-fill",
        { scale: 0, opacity: 0, transformOrigin: "center" },
        { scale: 1, opacity: 0.85, duration: 0.9, ease: "back.out(1.7)" },
        "-=0.6",
      )
      tl.to(".gsap-badge-node", {
        rotation: 360,
        transformOrigin: "100px 100px",
        duration: 3,
        ease: "none",
      })
    } else if (preset === "morph") {
      tl.to(".gsap-morph-box", {
        rotation: 180,
        scale: 1.15,
        borderRadius: "50%",
        duration: 1.4,
        ease: "power2.inOut",
      })
      tl.to(".gsap-morph-box", {
        rotation: 360,
        scale: 0.85,
        borderRadius: "16px",
        duration: 1.4,
        ease: "power2.inOut",
      })
    } else {
      tl.to(".gsap-orbit-group-a", {
        rotation: 360,
        transformOrigin: "100px 100px",
        duration: 3.5,
        ease: "none",
        repeat: -1,
      })
      tl.to(
        ".gsap-orbit-group-b",
        {
          rotation: -360,
          transformOrigin: "100px 100px",
          duration: 2.5,
          ease: "none",
          repeat: -1,
        },
        "<",
      )
    }
  }

  useEffect(() => {
    triggerAnimation(activePreset, speed)
    return () => {
      if (timelineRef.current) timelineRef.current.kill()
    }
  }, [activePreset, speed])

  const togglePlay = () => {
    if (!timelineRef.current) return
    if (timelineRef.current.paused()) {
      timelineRef.current.play()
      setIsPlaying(true)
    } else {
      timelineRef.current.pause()
      setIsPlaying(false)
    }
  }

  const restart = () => {
    if (timelineRef.current) {
      timelineRef.current.restart()
      setIsPlaying(true)
    }
  }

  return (
    <div className="gsap-showcase-container">
      {/* Top Header / Presets bar */}
      <div className="gsap-showcase-header">
        <div className="gsap-preset-pills">
          <button
            type="button"
            className={`gsap-pill ${activePreset === "logo" ? "active" : ""}`}
            onClick={() => setActivePreset("logo")}
          >
            <Sparkles size={12} /> Logo Draw
          </button>
          <button
            type="button"
            className={`gsap-pill ${activePreset === "morph" ? "active" : ""}`}
            onClick={() => setActivePreset("morph")}
          >
            Shape Morph
          </button>
          <button
            type="button"
            className={`gsap-pill ${activePreset === "orbit" ? "active" : ""}`}
            onClick={() => setActivePreset("orbit")}
          >
            Orbit Physics
          </button>
        </div>
        <div className="gsap-status-tag">
          <span className={`gsap-live-dot ${isPlaying ? "live" : "paused"}`} />
          GSAP 3.12
        </div>
      </div>

      {/* Center Canvas Stage */}
      <div className="gsap-stage" ref={stageRef}>
        {activePreset === "logo" && (
          <svg viewBox="0 0 200 200" className="gsap-svg-canvas">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            {/* Rivera 'A' Vector Monogram */}
            <path
              className="gsap-logo-path"
              d="M100 36 L150 156 L124 156 L100 98 L76 156 L50 156 Z"
              fill="none"
              stroke="url(#logoGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="gsap-logo-path"
              d="M72 124 L128 124"
              fill="none"
              stroke="url(#logoGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon
              className="gsap-logo-fill"
              points="100,58 120,110 80,110"
              fill="url(#logoGrad)"
            />
            <circle
              className="gsap-badge-node"
              cx="100"
              cy="36"
              r="4.5"
              fill="#38bdf8"
            />
          </svg>
        )}

        {activePreset === "morph" && (
          <div className="gsap-morph-wrapper">
            <div className="gsap-morph-box" />
            <div className="gsap-morph-core" />
          </div>
        )}

        {activePreset === "orbit" && (
          <svg viewBox="0 0 200 200" className="gsap-svg-canvas">
            <circle
              cx="100"
              cy="100"
              r="68"
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1.5"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="82"
              ry="38"
              fill="none"
              stroke="rgba(56,189,248,0.3)"
              strokeWidth="1.5"
              transform="rotate(-26 100 100)"
            />
            <g className="gsap-orbit-group-a">
              <circle cx="168" cy="100" r="7" fill="#38bdf8" />
            </g>
            <g className="gsap-orbit-group-b">
              <circle cx="34" cy="100" r="5" fill="#c084fc" />
            </g>
            <circle cx="100" cy="100" r="20" fill="url(#logoGrad)" />
          </svg>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="gsap-controls-bar">
        <div className="gsap-action-btns">
          <button
            type="button"
            className="gsap-ctrl-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <button
            type="button"
            className="gsap-ctrl-btn"
            onClick={restart}
            aria-label="Restart timeline"
          >
            <RotateCcw size={13} />
            <span>Replay</span>
          </button>
        </div>
        <div className="gsap-speed-toggle">
          <button
            type="button"
            className={`gsap-speed-btn ${speed === 1 ? "active" : ""}`}
            onClick={() => setSpeed(1)}
          >
            1x
          </button>
          <button
            type="button"
            className={`gsap-speed-btn ${speed === 2 ? "active" : ""}`}
            onClick={() => setSpeed(2)}
          >
            2x
          </button>
        </div>
      </div>
    </div>
  )
}

const weatherCities = [
  {
    city: "Digos City",
    province: "Davao del Sur",
    lat: 6.7494,
    lon: 125.3572,
    defaultType: "cloudy" as const,
    defaultTempC: 30,
    defaultCondition: "Partly Cloudy",
    defaultHumidity: 67,
    defaultWind: 8,
    defaultUv: "5 Moderate",
    defaultBg: "linear-gradient(145deg, #1e293b, #334155 55%, #0f172a)",
    defaultAccent: "#38bdf8",
  },
  {
    city: "Davao City",
    province: "Davao Region",
    lat: 7.1907,
    lon: 125.4553,
    defaultType: "sunny" as const,
    defaultTempC: 29,
    defaultCondition: "Golden Hour · Clear Sky",
    defaultHumidity: 75,
    defaultWind: 10,
    defaultUv: "6 High",
    defaultBg: "linear-gradient(145deg, #7c2d12, #c2410c 45%, #1e293b)",
    defaultAccent: "#fbbf24",
  },
  {
    city: "Cebu City",
    province: "Central Visayas",
    lat: 10.3157,
    lon: 123.8854,
    defaultType: "cloudy" as const,
    defaultTempC: 28,
    defaultCondition: "Partly Cloudy · Warm",
    defaultHumidity: 81,
    defaultWind: 12,
    defaultUv: "7 High",
    defaultBg: "linear-gradient(145deg, #1e293b, #334155 55%, #0f172a)",
    defaultAccent: "#38bdf8",
  },
  {
    city: "Manila",
    province: "Metro Manila",
    lat: 14.5995,
    lon: 120.9842,
    defaultType: "rainy" as const,
    defaultTempC: 29,
    defaultCondition: "Light Rain Showers",
    defaultHumidity: 68,
    defaultWind: 14,
    defaultUv: "8 Very High",
    defaultBg: "linear-gradient(145deg, #162447, #1f4068 62%, #0f172a)",
    defaultAccent: "#60a5fa",
  },
]

function parseWeatherCode(code: number, isDay: number = 1) {
  if (code === 0) {
    return {
      type: "sunny" as const,
      condition: isDay ? "Clear Sky · Sunny" : "Clear Sky · Starlit Night",
      bg: isDay
        ? "linear-gradient(145deg, #7c2d12, #c2410c 45%, #1e293b)"
        : "linear-gradient(145deg, #0f172a, #1e1b4b 60%, #090d16)",
      accent: isDay ? "#fbbf24" : "#93c5fa",
    }
  }
  if (code >= 1 && code <= 3) {
    return {
      type: code === 3 ? ("cloudy" as const) : ("sunny" as const),
      condition:
        code === 1
          ? "Mainly Clear"
          : code === 2
            ? "Partly Cloudy"
            : "Overcast · Cloudy",
      bg:
        code === 3
          ? "linear-gradient(145deg, #1e293b, #334155 55%, #0f172a)"
          : isDay
            ? "linear-gradient(145deg, #bd6a8d, #4569b3 65%, #183564)"
            : "linear-gradient(145deg, #1e1b4b, #312e81 65%, #0f172a)",
      accent: code === 3 ? "#38bdf8" : "#fbbf24",
    }
  }
  if (code === 45 || code === 48) {
    return {
      type: "cloudy" as const,
      condition: "Foggy · Low Visibility",
      bg: "linear-gradient(145deg, #334155, #475569 55%, #1e293b)",
      accent: "#94a3b8",
    }
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      type: "rainy" as const,
      condition:
        code >= 61 && code <= 65 ? "Tropical Rain Showers" : "Light Drizzle",
      bg: "linear-gradient(145deg, #162447, #1f4068 62%, #0f172a)",
      accent: "#60a5fa",
    }
  }
  if (code >= 95 && code <= 99) {
    return {
      type: "rainy" as const,
      condition: "Tropical Thunderstorm",
      bg: "linear-gradient(145deg, #181829, #282147 62%, #0b0f19)",
      accent: "#818cf8",
    }
  }
  return {
    type: "cloudy" as const,
    condition: "Fair Skies",
    bg: "linear-gradient(145deg, #1e293b, #334155 55%, #0f172a)",
    accent: "#38bdf8",
  }
}

type LiveCityWeather = {
  tempC: number
  humidity: number
  wind: number
  uv: string
  type: "sunny" | "rainy" | "cloudy"
  condition: string
  bg: string
  accent: string
}

function AnimatedWeatherWidget() {
  const [activeCityIndex, setActiveCityIndex] = useState(0)
  const [unit, setUnit] = useState<"C" | "F">("C")
  const [liveWeather, setLiveWeather] = useState<Record<number, LiveCityWeather>>({})
  const [isLive, setIsLive] = useState<boolean>(false)

  const cityConfig = weatherCities[activeCityIndex]
  const current = liveWeather[activeCityIndex] ?? {
    tempC: cityConfig.defaultTempC,
    humidity: cityConfig.defaultHumidity,
    wind: cityConfig.defaultWind,
    uv: cityConfig.defaultUv,
    type: cityConfig.defaultType,
    condition: cityConfig.defaultCondition,
    bg: cityConfig.defaultBg,
    accent: cityConfig.defaultAccent,
  }

  useEffect(() => {
    let isMounted = true

    async function fetchRealTimeWeather() {
      try {
        const lats = weatherCities.map((c) => c.lat).join(",")
        const lons = weatherCities.map((c) => c.lon).join(",")
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=uv_index&forecast_days=1`,
        )
        if (!res.ok) return
        const data = await res.json()
        const results = Array.isArray(data) ? data : [data]

        if (!isMounted) return

        const updated: Record<number, LiveCityWeather> = {}
        const currentHour = new Date().getHours()

        results.forEach((item, idx) => {
          if (!item?.current) return
          const code = item.current.weather_code ?? 0
          const isDay = item.current.is_day ?? 1
          const parsed = parseWeatherCode(code, isDay)
          const uvVal = item.hourly?.uv_index?.[currentHour] ?? 5
          const uvLabel =
            uvVal <= 2
              ? `${Math.round(uvVal)} Low`
              : uvVal <= 5
                ? `${Math.round(uvVal)} Moderate`
                : uvVal <= 7
                  ? `${Math.round(uvVal)} High`
                  : `${Math.round(uvVal)} Very High`

          updated[idx] = {
            tempC: Math.round(item.current.temperature_2m),
            humidity: Math.round(item.current.relative_humidity_2m),
            wind: Math.round(item.current.wind_speed_10m),
            uv: uvLabel,
            type: parsed.type,
            condition: parsed.condition,
            bg: parsed.bg,
            accent: parsed.accent,
          }
        })

        setLiveWeather(updated)
        setIsLive(true)
      } catch (err) {
        console.warn("Real-time weather API notice:", err)
      }
    }

    fetchRealTimeWeather()
    const timer = setInterval(fetchRealTimeWeather, 10 * 60 * 1000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const displayTemp =
    unit === "C" ? current.tempC : Math.round((current.tempC * 9) / 5 + 32)

  return (
    <div
      className="weather-widget-container"
      style={{ background: current.bg }}
    >
      {/* Top City Bar */}
      <div className="weather-top-bar">
        <div className="weather-city-tabs">
          {weatherCities.map((c, i) => (
            <button
              key={c.city}
              type="button"
              className={`weather-city-tab ${i === activeCityIndex ? "active" : ""}`}
              onClick={() => setActiveCityIndex(i)}
            >
              {c.city.replace(" City", "")}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="weather-unit-btn"
          onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
          aria-label="Toggle Celsius or Fahrenheit"
        >
          °{unit}
        </button>
      </div>

      {/* Main Temperature & Animated Icon Display */}
      <div className="weather-main-display">
        <div className="weather-temp-info">
          <div className="weather-location-tag">
            <MapPin size={13} />
            <span>
              {cityConfig.city} · {cityConfig.province}
            </span>
          </div>
          <div className="weather-degrees">
            {displayTemp}
            <span className="weather-degree-symbol">°{unit}</span>
          </div>
          <p className="weather-condition-text">{current.condition}</p>
        </div>

        <div className="weather-visual-icon">
          {current.type === "sunny" && (
            <div className="weather-sun-group">
              <div className="weather-sun-glow" />
              <Sun size={64} className="weather-sun-icon" />
            </div>
          )}
          {current.type === "rainy" && (
            <div className="weather-rain-group">
              <CloudRain size={60} className="weather-cloud-icon" />
              <div className="weather-raindrops">
                <span className="drop drop-1" />
                <span className="drop drop-2" />
                <span className="drop drop-3" />
              </div>
            </div>
          )}
          {current.type === "cloudy" && (
            <div className="weather-cloud-group">
              <Cloud size={64} className="weather-cloud-floating" />
              <Sun size={32} className="weather-sun-behind" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Metrics Gauges */}
      <div className="weather-metrics-grid">
        <div className="weather-metric-item">
          <div className="metric-label">
            <Droplets size={12} /> Humidity
          </div>
          <strong>{current.humidity}%</strong>
          <div className="metric-progress-track">
            <div
              className="metric-progress-fill"
              style={{ width: `${current.humidity}%`, backgroundColor: current.accent }}
            />
          </div>
        </div>

        <div className="weather-metric-item">
          <div className="metric-label">
            <Wind size={12} /> Wind
          </div>
          <strong>{current.wind} km/h</strong>
          <div className="metric-progress-track">
            <div
              className="metric-progress-fill"
              style={{
                width: `${Math.min(100, current.wind * 4)}%`,
                backgroundColor: current.accent,
              }}
            />
          </div>
        </div>

        <div className="weather-metric-item">
          <div className="metric-label">
            <Sun size={12} /> UV Index
          </div>
          <strong className="weather-uv-badge">{current.uv}</strong>
          <small className="weather-live-tag">
            <span className="weather-pulse" /> {isLive ? "LIVE API (OPEN-METEO)" : "LIVE SIM"}
          </small>
        </div>
      </div>
    </div>
  )
}

function ProjectVisual({ style }: { style: ProjectItem["visualStyle"] }) {
  if (style === "orbit") {
    return <GsapMotionShowcase />
  }
  if (style === "weather") {
    return <AnimatedWeatherWidget />
  }
  return <CertificateSwipeGallery />
}

export default function PortfolioClient({
  projects,
  career,
}: Props) {
  const root = useRef<HTMLDivElement>(null)

  // Initialize GSAP entrance and ScrollTrigger animations.
  // Using `useEffect` avoids React's SSR `useLayoutEffect` console warnings.
  useEffect(() => {
    // Respect accessibility settings for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const context = gsap.context((self) => {
      // Hero elements entrance animation
      gsap.from(".hero-reveal", {
        y: 34,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity", // Clears inline styles after animation so CSS hover transitions work
      })

      // Continuous floating ambient motion for the hero orb
      gsap.to(".hero-orb", {
        y: -14,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Query elements with .reveal strictly scoped inside root container
      const reveals = self.selector
        ? (self.selector(".reveal") as HTMLElement[])
        : gsap.utils.toArray<HTMLElement>(".reveal", root.current)

      // ScrollTrigger reveal animation for cards and sections
      reveals.forEach((element) => {
        gsap.from(element, {
          y: 48,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          // IMPORTANT: `clearProps: "transform,opacity"` removes inline style transforms when the animation completes.
          // Without this, inline `transform: translate(0px, 0px)` overrides CSS `.skill-card:hover { transform: translateY(-4px) }`
          // and breaks CSS position: sticky on `.experience-heading`.
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        })
      })
    }, root)

    return () => context.revert() // Cleanup GSAP context on unmount
  }, [])

  return (
    <div ref={root}>
      <header className="site-header">
        <div className="shell nav-inner">
          <Brand />
          <nav aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#credentials">Credentials</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="nav-cta" href="#contact">
            Let’s build something amazing <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero shell" id="top">
          <div className="hero-copy">
            <p className="eyebrow hero-reveal">
              <span className="availability-dot" /> Available for select
              projects
            </p>
            <h1 className="hero-reveal">
              Digital experiences
              <br />
              that feel <em>alive.</em>
            </h1>
            <p className="hero-lead hero-reveal">
              I’m Ashlee Nicole T. Rivera, a creative front-end developer and logo designer, crafting
              thoughtful, motion-led websites that help ambitious ideas connect
              with real people.
            </p>
            <div className="hero-actions hero-reveal">
              <a className="button primary" href="#projects">
                View my work <ArrowDown size={18} />
              </a>
              <a className="button secondary" href="#contact">
                Contact me <ArrowUpRight size={18} />
              </a>
            </div>
            {/* Social media presence: GitHub, Facebook, LinkedIn, and Gmail */}
            <div className="hero-socials hero-reveal">
              <span>Find me online</span>
              <a
                href="https://github.com/4shLee"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
              >
                <GithubIcon size={17} />
              </a>
              {/* Facebook Profile Link - replace with your exact profile URL if needed */}
              <a
                href="https://www.facebook.com/a.ashdieee"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookIcon size={17} />
              </a>
              <a
                href="https://www.linkedin.com/in/ashlee-nicole-rivera-101131356/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon size={17} />
              </a>
              <a
                href="mailto:ashdieee@gmail.com"
                aria-label="Gmail"
                title="Gmail: ashdieee@gmail.com"
              >
                <Mail size={17} />
              </a>
            </div>
          </div>
          <div className="hero-media hero-reveal">
            <div className="hero-orb" />
            <div className="portrait-frame">
              <Image
                src="/profile.jpg"
                alt="Portrait photo of Ashlee"
                fill
                priority
                sizes="(max-width: 768px) 88vw, 38vw"
              />
              <div className="portrait-tint" />
            </div>
            <div className="profile-badge">
              <span>Based in</span>
              <strong>
                <MapPin size={14} /> Digos City, Philippines
              </strong>
            </div>
          </div>
        </section>

        <section className="about section" id="about">
          <div className="shell about-layout reveal">
            <div>
              <p className="section-label">
                <span>01</span> About me
              </p>
              <div className="about-image">
                <Image
                  src="/profile.jpg"
                  alt="Portrait photo of Ashlee"
                  fill
                  sizes="(max-width: 768px) 100vw, 32vw"
                />
              </div>
            </div>
            <div className="about-content">
              <h2>
                Thoughtful design.
                <br />
                <em>Memorable outcomes.</em>
              </h2>
              <p className="about-intro">
                I work at the intersection of development, motion, and visual
                design turning early ideas into polished digital experiences.
              </p>
              <div className="about-columns">
                <p>
                  Hello! I’m a 4th-year IT student at Cor Jesu College based in Digos City, Philippines, dedicated to bringing ideas to life through digital design.
                  Whether it’s designing custom logos, eye-catching packaging, or detailed magazine catalogs,
                  I put my heart into ensuring every piece feels uniquely tailored to my clients' needs and aspirations.
                </p>
                <p>
                  I’m currently deepening my expertise in React, Next.js, GSAP, Vue
                  and accessible interaction design while partnering with people
                  who value craft and honest collaboration.
                </p>
              </div>
              <div className="strengths">
                <span>
                  <CheckCircle2 size={20} /> Clear communication
                </span>
                <span>
                  <CheckCircle2 size={20} /> Design-minded development
                </span>
                <span>
                  <CheckCircle2 size={20} /> Detail-oriented delivery
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" id="skills">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="section-label">
                  <span>02</span> Skills & expertise
                </p>
                <h2>
                  Tools I use to turn
                  <br />
                  <em>ideas into impact.</em>
                </h2>
              </div>
              <p>
                Focused capabilities for modern, expressive, and maintainable
                digital products.
              </p>
            </div>
            <div className="skills-grid">
              {skills.map(
                ({ icon: Icon, title, description, items }, index) => (
                  <article className="skill-card reveal" key={title}>
                    <div className="skill-top">
                      <span className="skill-icon">
                        <Icon size={21} />
                      </span>
                      <span>0{index + 1}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div className="chip-list">
                      {items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="section projects-section" id="projects">
          <div className="shell">
            <div className="section-heading reveal">
              <div>
                <p className="section-label">
                  <span>03</span> Selected projects
                </p>
                <h2>
                  Work built with
                  <br />
                  <em>purpose and curiosity.</em>
                </h2>
              </div>
              <p>
                Experiments and client-ready concepts exploring motion,
                interaction, and modern front-end craft.
              </p>
            </div>
            <div className="project-grid">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <article
                    className="project-card reveal"
                    key={project.id}
                    id={project.visualStyle === "gallery" ? "credentials" : undefined}
                  >
                    <div className="project-media">
                      {project.thumbnail ? (
                        <Image
                          src={project.thumbnail.url}
                          alt={project.thumbnail.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <ProjectVisual style={project.visualStyle} />
                      )}
                    </div>
                    <div className="project-body">
                      <div className="project-index">0{index + 1}</div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="chip-list">
                        {project.technologies.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                      <div className="project-actions">
                        {project.repositoryUrl && (
                          <a
                            href={ensureExternalUrl(project.repositoryUrl)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Code2 size={17} /> GitHub repo
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={ensureExternalUrl(project.demoUrl)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={17} /> Live demo
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state reveal">
                  <Code2 size={24} />
                  <h3>Projects are being prepared</h3>
                  <p>
                    New case studies will appear here as soon as they are
                    published.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="shell">
            <div className="contact-heading reveal">
              <p className="section-label">
                <span>04</span> Let’s work together
              </p>
              <h2>
                Have an idea in mind?
                <br />
                <em>Let’s make it real.</em>
              </h2>
              <p>
                Share a little about your project. I’ll respond with thoughtful
                next steps — usually within two business days.
              </p>
            </div>
            <div className="contact-layout">
              <aside className="contact-aside reveal">
                <div>
                  <span className="contact-icon">
                    <Mail size={20} />
                  </span>
                  <small>Email</small>
                  <a href="mailto:ashdieee@gmail.com">ashdieee@gmail.com</a>
                </div>
                <div>
                  <span className="contact-icon">
                    <MapPin size={20} />
                  </span>
                  <small>Location</small>
                  <p>Digos City, Philippines · Available worldwide</p>
                </div>
                <div className="direct-links">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=ashdieee@gmail.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Email me (Gmail) <ArrowUpRight size={16} />
                  </a>
                  <a
                    href="https://github.com/4shLee"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub <ArrowUpRight size={16} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ashlee-nicole-rivera-101131356/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn <ArrowUpRight size={16} />
                  </a>
                  <a
                    href="https://www.facebook.com/a.ashdieee"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Facebook <ArrowUpRight size={16} />
                  </a>
                </div>
              </aside>
              <div className="reveal">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell footer-top">
          <div>
            <Brand />
            <p>
              Creative front-end developer crafting expressive digital
              experiences.
            </p>
          </div>
          <div className="footer-nav">
            <strong>Navigate</strong>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#credentials">Credentials</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-nav">
            <strong>Connect</strong>
            <a href="mailto:ashdieee@gmail.com">Gmail</a>
            <a
              href="https://github.com/4shLee"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ashlee-nicole-rivera-101131356/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://www.facebook.com/a.ashdieee"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} 2026 Ashlee Rivera. Built with passion in Digos City, Philippines..
          </p>
          <a href="#top">
            Back to top <ArrowUpRight size={15} />
          </a>
        </div>
      </footer>
    </div>
  )
}
