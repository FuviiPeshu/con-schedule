import tsPlugin from "@typescript-eslint/eslint-plugin";

const sourceFiles = ["src/**/*.{ts,tsx}"];

export default [
    { ignores: ["coverage/**", "dist/**"] },
    ...tsPlugin.configs["flat/recommended"].map((config) => ({
        ...config,
        files: config.files ?? sourceFiles,
    })),
];
