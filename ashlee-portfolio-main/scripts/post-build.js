import fs from "fs"
import path from "path"

// Ensures that if Next.js generates a .next/standalone folder, the public folder is copied into it
const standaloneDir = path.join(process.cwd(), ".next", "standalone")
const standalonePublic = path.join(standaloneDir, "public")
const rootPublic = path.join(process.cwd(), "public")

if (fs.existsSync(standaloneDir) && fs.existsSync(rootPublic)) {
  fs.cpSync(rootPublic, standalonePublic, { recursive: true })
  console.log("✓ Copied public assets to .next/standalone/public")
}
