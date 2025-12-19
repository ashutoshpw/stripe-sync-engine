import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/drizzle-schema/index.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  schemaFilter: ["stripe"],
})

