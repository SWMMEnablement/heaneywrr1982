import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Embeds public/cost-allocation-explorer.md into index.html so the summary
// travels with the page even when the sidecar file is missing.
const embedTechSummary = () => ({
  name: "embed-tech-summary",
  transformIndexHtml(html: string) {
    const md = fs.readFileSync(path.resolve(__dirname, "public/cost-allocation-explorer.md"), "utf8");
    const safe = md.replace(/<\/script/gi, "<\\/script");
    return html.replace("</body>", `<script type="text/markdown" id="app-md">\n${safe}</script>\n</body>`);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), embedTechSummary(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
