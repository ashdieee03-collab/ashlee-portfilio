"use client"

import { useActionState, useEffect, useRef } from "react"
import { ArrowUpRight, LoaderCircle, Send } from "lucide-react"
import { submitContactForm, type ContactFormState } from "../actions"

const initialState: ContactFormState = {
  status: "idle",
  message: "",
}

export default function ContactForm() {
  // React 19 / Next.js Server Action state hook for form submission
  const [state, action, pending] = useActionState(
    submitContactForm,
    initialState,
  )
  const formRef = useRef<HTMLFormElement>(null)

  // Automatically clear form input fields upon successful submission
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset()
  }, [state.status])

  return (
    // `noValidate` prevents default browser tooltips so we can render our custom styled error states
    <form ref={formRef} action={action} className="contact-form" noValidate>
      {/* Honeypot field: Hidden from users; if bots fill this out, submission is silently discarded */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-grid">
        <label htmlFor="fullName">
          <span>Full name</span>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            aria-invalid={Boolean(state.errors?.fullName)}
            aria-describedby={
              state.errors?.fullName ? "fullName-error" : undefined
            }
            placeholder="Your name"
          />
          {state.errors?.fullName && (
            <small id="fullName-error">{state.errors.fullName}</small>
          )}
        </label>
        <label htmlFor="email">
          <span>Email address</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={180}
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            placeholder="you@company.com"
          />
          {state.errors?.email && (
            <small id="email-error">{state.errors.email}</small>
          )}
        </label>
        <label htmlFor="subject">
          <span>Subject</span>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            minLength={3}
            maxLength={140}
            aria-invalid={Boolean(state.errors?.subject)}
            aria-describedby={
              state.errors?.subject ? "subject-error" : undefined
            }
            placeholder="What can I help with?"
          />
          {state.errors?.subject && (
            <small id="subject-error">{state.errors.subject}</small>
          )}
        </label>
        <label htmlFor="projectType">
          <span>Project type</span>
          <select
            id="projectType"
            name="projectType"
            required
            defaultValue=""
            aria-invalid={Boolean(state.errors?.projectType)}
            aria-describedby={
              state.errors?.projectType ? "projectType-error" : undefined
            }
          >
            <option value="" disabled>
              Select a project
            </option>
            <option value="website">Website or portfolio</option>
            <option value="interactive">Interactive experience</option>
            <option value="frontend">Front-end development</option>
            <option value="design">Design collaboration</option>
            <option value="other">Other</option>
          </select>
          {state.errors?.projectType && (
            <small id="projectType-error">{state.errors.projectType}</small>
          )}
        </label>
      </div>
      <label className="message-field" htmlFor="message">
        <span>Message</span>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          aria-invalid={Boolean(state.errors?.message)}
          aria-describedby={
            state.errors?.message ? "message-error" : undefined
          }
          placeholder="Tell me about your goals, timeline, and what success looks like."
        />
        {state.errors?.message && (
          <small id="message-error">{state.errors.message}</small>
        )}
      </label>
      <div className="form-submit">
        <button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <Send size={18} />
          )}
          {pending ? "Sending…" : "Send message"}
          {!pending && <ArrowUpRight size={18} />}
        </button>
        <div
          className={`form-status ${state.status}`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </div>
      </div>
    </form>
  )
}
