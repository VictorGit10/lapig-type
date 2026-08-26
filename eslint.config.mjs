import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', '.vinext/**', 'dist/**', 'out/**', 'build/**', 'next-env.d.ts', 'supabase/.temp/**', 'supabase/functions/**']),
]);

export default eslintConfig;
