import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { quotesApi } from "./server/quotes";

export default defineConfig({
  plugins: [react(), tailwindcss(), quotesApi()],
  server: {
    fs: {
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.data/**"],
    },
  },
});
