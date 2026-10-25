import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * Custom 404 (Not Found) page for the frontend.
 * Renders when `notFound()` is invoked or when a non-existent URL is accessed.
 * Styled with high-contrast text and custom theme tokens to match the dark navy portfolio design.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-8 py-24 text-center">
      {/* 404 Status Pill with subtle red accent glow */}
      <span className="eyebrow">
        <span
          className="availability-dot"
          style={{
            background: "#ff7b8b",
            boxShadow: "0 0 0 0.35rem rgba(255, 123, 139, 0.15)",
          }}
        />
        404 Error
      </span>
      <h1 className="mt-4 font-['var(--display)'] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[#93a3b8]">
        The page you&apos;re looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
      </p>
      <Link
        className="button primary mt-8"
        href="/"
      >
        Back to Home <ArrowUpRight size={16} />
      </Link>
    </main>
  )
}
