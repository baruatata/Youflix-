import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mradi unatumia hash-routing (#home, #movies...), kwa hiyo hauhitaji mpangilio wa seva.
// Kama utaiweka kwenye folda ndogo (mf. GitHub Pages /Youflix/), weka base: "/Youflix/".
export default defineConfig({
  plugins: [react()],
  build: { target: "es2019", sourcemap: false },
});
