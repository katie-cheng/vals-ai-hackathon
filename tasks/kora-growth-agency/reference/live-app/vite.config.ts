import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Images and video are shared with the solution app instead of duplicated.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: "../../solution/app/public",
});
