import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import babel from "@rolldown/plugin-babel";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const conventionConfig = JSON.parse(
    readFileSync(resolve(process.cwd(), "config/schedule-config.json"), "utf8")
) as {
    apiUrl: string;
};

export default defineConfig(({ mode }) => {
    return {
        base: process.env.GITHUB_ACTIONS === "true" ? "/con-schedule/" : "/",
        plugins: [
            react(),
            babel({
                plugins: [
                    [
                        "babel-plugin-styled-components",
                        {
                            displayName: mode === "development",
                            fileName: mode === "development",
                            meaninglessFileNames: ["index", "styles"],
                            pure: true,
                        },
                    ],
                ],
            }),
        ],
        server: {
            proxy: {
                // Proxies the configured API to avoid CORS (for localhost)
                "/schedule-api": {
                    target: conventionConfig.apiUrl,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/schedule-api/, ""),
                },
            },
        },
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: ["./src/setupTests.ts"],
            coverage: {
                provider: "v8",
                reporter: ["text"],
                include: ["src/**/*.{ts,tsx}"],
                exclude: [
                    "src/**/*.styled.ts",
                    "src/**/*.test.{ts,tsx}",
                    "src/__mocks__/**",
                    "src/index.tsx",
                    "src/setupTests.ts",
                    "src/styles/GlobalStyles.ts",
                    "src/vite-env.d.ts",
                ],
            },
        },
    };
});
