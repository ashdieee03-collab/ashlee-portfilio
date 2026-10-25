import type {
  CareerEntry,
  Credential,
  Media,
  PortfolioProject,
} from "@/payload-types"
import { getPayloadClient } from "@/lib/payload"
import PortfolioClient from "./_components/PortfolioClient"

// Force this page to be statically generated at build time (with ISR revalidation on CMS writes)
export const dynamic = "force-static"

/**
 * Helper: Safely converts a Payload Media relationship into a format compatible with Next.js <Image />.
 * Handles cases where the relationship is only an ID string, null, or missing alt text.
 */
const asMedia = (value: string | Media | null | undefined) =>
  value && typeof value === "object" && value.url
    ? {
        url: value.url,
        alt: value.alt || "", // Guarantees a string to avoid Next.js Image missing-alt warnings
        width: value.width ?? undefined,
        height: value.height ?? undefined,
      }
    : null

// Default starter projects ensuring at least 3 React/GSAP mini-projects are always rendered
// in compliance with academic & course portfolio requirements
const defaultProjects = [
  {
    id: "project-1",
    title: "Interactive GSAP Showcase",
    description:
      "A high-performance landing experience featuring smooth ScrollTrigger timeline animations, interactive hover dynamics, and responsive layout.",
    technologies: ["React", "GSAP", "ScrollTrigger", "Tailwind CSS"],
    thumbnail: null,
    repositoryUrl: "https://github.com/4shLee",
    demoUrl: "https://github.com/4shLee",
    visualStyle: "orbit" as const,
  },
  {
    id: "project-2",
    title: "Animated Metrics & Weather App",
    description:
      "A sleek dashboard application featuring micro-interactions, dynamic state management, and animated SVG temperature & weather visualizers.",
    technologies: ["React", "GSAP", "REST API", "Tailwind CSS"],
    thumbnail: null,
    repositoryUrl: "https://github.com/4shLee",
    demoUrl: "https://github.com/4shLee",
    visualStyle: "weather" as const,
  },
  {
    id: "project-3",
    title: "Credential Card Gallery",
    description:
      "An interactive showcase gallery featuring 3D stacked swipeable certificate cards, smooth touch transitions, and responsive motion controls.",
    technologies: ["React", "Next.js", "GSAP", "Touch Gestures", "CSS 3D"],
    thumbnail: null,
    repositoryUrl: "https://github.com/4shLee/Rivera-portfolio.git",
    demoUrl: "https://github.com/4shLee",
    visualStyle: "gallery" as const,
  },
]

export default async function HomePage() {
  let projectDocs: PortfolioProject[] = []
  let credentialDocs: Credential[] = []
  let careerDocs: CareerEntry[] = []

  // Query Payload CMS only when running inside the Figma Make environment (where
  // platform database credentials are authenticated). When running locally or on Vercel,
  // gracefully use the built-in starter projects without throwing server console errors.
  if (process.env.FIGMA === "1") {
    try {
      const payload = await getPayloadClient()
      const [projectResult, credentialResult, careerResult] = await Promise.all([
        // Fetch featured projects sorted by order
        payload.find({
          collection: "portfolio-projects",
          overrideAccess: false,
          depth: 1, // Depth 1 populates the thumbnail Media relationship
          limit: 20,
          sort: "order",
          where: { featured: { equals: true } },
        }),
        // Fetch verified credentials sorted by order
        payload.find({
          collection: "credentials",
          overrideAccess: false,
          depth: 1, // Depth 1 populates the certificate Media relationship
          limit: 30,
          sort: "order",
        }),
        // Fetch career milestones sorted by order
        payload.find({
          collection: "career-entries",
          overrideAccess: false,
          depth: 0, // Depth 0 is sufficient since career entries have no media relations
          limit: 30,
          sort: "order",
        }),
      ])

      projectDocs = (projectResult.docs as PortfolioProject[]) ?? []
      credentialDocs = (credentialResult.docs as Credential[]) ?? []
      careerDocs = (careerResult.docs as CareerEntry[]) ?? []
    } catch (error) {
      console.warn("Unable to load portfolio entries from Payload:", error)
    }
  }

  // Transform raw Payload project records into clean props for PortfolioClient,
  // falling back to defaultProjects if no database records are present yet
  const projects =
    projectDocs.length > 0
      ? projectDocs.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          technologies:
            project.technologies?.map((item) => item.name).filter(Boolean) ?? [],
          thumbnail: asMedia(project.thumbnail),
          repositoryUrl: project.repositoryUrl,
          demoUrl: project.demoUrl,
          visualStyle: project.visualStyle ?? "orbit",
        }))
      : defaultProjects

  // Transform raw Payload credential records, ensuring only credentials with valid certificates are rendered
  const credentials = credentialDocs
    .map((credential) => {
      const certificate = asMedia(credential.certificate)
      return certificate
        ? {
            id: credential.id,
            title: credential.title,
            issuer: credential.issuer,
            issuedAt: credential.issuedAt,
            credentialId: credential.credentialId,
            certificate,
            certificateUrl: credential.certificateUrl,
            verificationUrl: credential.verificationUrl,
          }
        : null
    })
    .filter((credential): credential is NonNullable<typeof credential> =>
      Boolean(credential),
    )

  // Transform raw Payload career entries into timeline items
  const career = careerDocs.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    organization: entry.organization,
    location: entry.location,
    startDate: entry.startDate,
    endDate: entry.endDate,
    current: entry.current,
    description: entry.description,
    // Safely extract highlights without throwing if undefined
    highlights:
      entry.highlights?.map((item) => item.highlight).filter(Boolean) ?? [],
  }))

  return (
    <PortfolioClient
      projects={projects}
      credentials={credentials}
      career={career}
    />
  )
}
