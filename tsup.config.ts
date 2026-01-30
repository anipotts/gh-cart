import { defineConfig } from 'tsup';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Stub out react-devtools-core (Ink optional dev dependency)
const stubDir = join('node_modules', 'react-devtools-core');
mkdirSync(stubDir, { recursive: true });
writeFileSync(join(stubDir, 'index.js'), 'export default undefined;\n');
writeFileSync(
  join(stubDir, 'package.json'),
  JSON.stringify({ name: 'react-devtools-core', version: '0.0.0', type: 'module', main: 'index.js' })
);

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  target: 'node18',
  banner: {
    // esbuild's ESM output shims require() but it's broken for Node builtins.
    // Inject a real require() via createRequire so CJS deps can load builtins.
    js: "import {createRequire} from 'module';const require=createRequire(import.meta.url);",
  },
  clean: true,
  splitting: false,
  noExternal: [/(.*)/],
});
