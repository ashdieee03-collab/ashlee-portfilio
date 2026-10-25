import React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { DM_Sans, Manrope } from "next/font/google"
import { BodyCustomCode, renderHeadCustomCode } from "@/lib/make-custom-code"
import {
  makeSiteSettings,
  sanitizeHtmlAttribute,
} from "@/lib/make-site-settings"
import "./styles.css"

const displayFont = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
})

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
})

const defaultTitle = "Ashlee Rivera — Creative Front-End Developer"
const title = makeSiteSettings.title ?? defaultTitle
const description =
  makeSiteSettings.description ??
  "Creative front-end developer crafting expressive, accessible websites with React, Next.js, and GSAP."
const favicon = makeSiteSettings.icons?.icon
const socialImage = makeSiteSettings.openGraph?.image
const googleAnalyticsId = sanitizeHtmlAttribute(
  makeSiteSettings.analytics?.googleAnalyticsId,
)

// Normalize site URL with an explicit protocol (http:// or https://)
// so that `new URL()` does not throw a TypeError if the environment variable lacks a scheme.
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const validSiteUrl =
  rawSiteUrl.startsWith("http://") || rawSiteUrl.startsWith("https://")
    ? rawSiteUrl
    : `https://${rawSiteUrl}`

export const metadata: Metadata = {
  metadataBase: new URL(validSiteUrl),
  title,
  description,
  robots:
    makeSiteSettings.robots?.index === false
      ? { follow: false, index: false }
      : undefined,
  icons: favicon ? { icon: favicon } : undefined,
  openGraph: {
    title,
    description,
    images: socialImage ? [socialImage] : undefined,
  },
  twitter: socialImage
    ? {
        card: "summary_large_image",
        images: [socialImage],
      }
    : undefined,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = sanitizeHtmlAttribute(makeSiteSettings.language) || "en"
  const addBypassLinks = makeSiteSettings.accessibility?.addBypassLinks === true
  const customScripts = makeSiteSettings.customScripts

  return (
    <html lang={language}>
      <head>
        {renderHeadCustomCode(customScripts?.headStart, "head-start")}
        {renderHeadCustomCode(customScripts?.headEnd, "head-end")}
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen antialiased`}
      >
        <BodyCustomCode html={customScripts?.bodyStart} />
        {addBypassLinks && (
          <a className="figma-bypass-link" href="#root">
            Skip to content
          </a>
        )}
        <div id="root" tabIndex={-1}>
          {children}
        </div>
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="figma-google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', ${JSON.stringify(googleAnalyticsId)});`,
              }}
            />
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}
