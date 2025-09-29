import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // ✅ Allow `any`
      "@typescript-eslint/no-explicit-any": "off",

      // ✅ Allow quotes like " and ' directly in JSX
      "react/no-unescaped-entities": "off",

      // ✅ Ignore exhaustive deps warnings in useEffect
      "react-hooks/exhaustive-deps": "off",

      // ✅ Allow empty interfaces
      "@typescript-eslint/no-empty-object-type": "off",

      // ✅ Allow unused imports/vars for now
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
