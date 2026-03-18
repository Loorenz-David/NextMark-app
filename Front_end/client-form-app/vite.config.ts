import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// TODO: set base URL and API proxy target from env
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "", "");

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        "/api_v2": {
          target: env.VITE_API_BASE_URL || "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
