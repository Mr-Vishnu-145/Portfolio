import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { componentTagger } from "lovable-tagger";

const gitAutoPushPlugin = (): Plugin => ({
  name: "git-auto-push-plugin",
  configureServer(server) {
    server.middlewares.use("/__git-save", (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const { code } = JSON.parse(body);
          if (!code) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: "No code provided" }));
            return;
          }

          const targetFilePath = path.resolve(__dirname, "./src/lib/portfolioData.ts");
          fs.writeFileSync(targetFilePath, code, "utf-8");

          exec(
            'git add src/lib/portfolioData.ts && git commit -m "Update portfolio content via Admin Panel" && git push',
            { cwd: __dirname },
            (error, stdout, stderr) => {
              if (error) {
                console.error("Git push error:", error, stderr);
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    success: true,
                    message: "Saved file locally! Git push warning: " + (error.message || stderr),
                  })
                );
                return;
              }

              console.log("Git push stdout:", stdout);
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  message: "Successfully saved to portfolioData.ts, committed, and pushed to GitHub!",
                })
              );
            }
          );
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, message: (e as Error).message }));
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => ({
  base: "/Portfolio/",   

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    gitAutoPushPlugin(),
    mode === "development" && componentTagger()
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));