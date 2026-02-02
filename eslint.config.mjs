import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next and local generated artifacts:
        ".next/**",
        "my-next-app/.next/**",
        "out/**",
        "build/**",
        "node_modules/**",
        "tsconfig.tsbuildinfo",
        "next-env.d.ts",
        "dist/**",
        "coverage/**",
        ".vscode/**",
    ]),
]);

export default eslintConfig;