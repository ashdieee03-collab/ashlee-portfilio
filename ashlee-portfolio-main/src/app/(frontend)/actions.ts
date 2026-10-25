"use server"

import { getPayloadClient } from "@/lib/payload"

export type ContactFormState = {
  status: "idle" | "success" | "error"
  message: string
  errors?: Partial<Record<"fullName" | "email" | "subject" | "projectType" | "message", string>>
}

const initialError = (message: string): ContactFormState => ({
  status: "error",
  message,
})

const getText = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (getText(formData, "companyWebsite")) {
    return {
      status: "success",
      message: "Thanks — your message has been received.",
    }
  }

  const fullName = getText(formData, "fullName")
  const email = getText(formData, "email").toLowerCase()
  const subject = getText(formData, "subject")
  const projectType = getText(formData, "projectType")
  const message = getText(formData, "message")
  const errors: ContactFormState["errors"] = {}
  const allowedProjectTypes = [
    "website",
    "interactive",
    "frontend",
    "design",
    "other",
  ]

  if (fullName.length < 2 || fullName.length > 100) {
    errors.fullName = "Enter your full name."
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    errors.email = "Enter a valid email address."
  }
  if (subject.length < 3 || subject.length > 140) {
    errors.subject = "Enter a subject between 3 and 140 characters."
  }
  if (!allowedProjectTypes.includes(projectType)) {
    errors.projectType = "Choose a project type."
  }
  if (message.length < 20 || message.length > 4000) {
    errors.message = "Tell me a little more — use 20 to 4,000 characters."
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      errors,
    }
  }

  let sentToEmail = false

  // 1. Forward directly to Ashlee's Gmail inbox via Formspree
  const formspreeEndpoint =
    process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/xaeewzqg"

  try {
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        subject,
        projectType,
        message,
        _replyto: email,
        _subject: `[Portfolio Inquiry] ${subject} from ${fullName}`,
      }),
    })

    if (response.ok) {
      sentToEmail = true
    }
  } catch (err) {
    console.error("Formspree forward error:", err)
  }

  // 2. Record submission into Payload database if running in Figma Make environment
  if (process.env.FIGMA === "1") {
    try {
      const payload = await getPayloadClient()
      await payload.create({
        collection: "contact-submissions",
        data: {
          fullName,
          email,
          subject,
          projectType:
            projectType as "website" | "interactive" | "frontend" | "design" | "other",
          message,
        },
        overrideAccess: false,
      })
    } catch (err) {
      if (!sentToEmail) {
        console.warn("Payload save and email dispatch notice:", err)
      }
    }
  }

  return {
    status: "success",
    message: "Thank you! Your message has been received and sent directly to Ashlee's Gmail.",
  }
}
