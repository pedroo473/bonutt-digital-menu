// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app may break with duplicate plugins:
//   - TanStack devtools, tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     Nitro, VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection.
//
// For Netlify, keep the Lovable wrapper and explicitly select Nitro's Netlify preset.
// Nitro writes the deployable static assets to dist/ and its server runtime to
// Netlify's Frameworks API output directories.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  nitro: {
    preset: "netlify",
  },
});
