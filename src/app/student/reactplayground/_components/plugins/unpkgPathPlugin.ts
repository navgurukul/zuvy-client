import * as esbuild from 'esbuild-wasm';

/**
 * A set of all filenames in the virtual file system — updated before each build.
 * Using a module-level set so unpkgPathPlugin can check without needing to be recreated.
 */
let virtualFileNames: Set<string> = new Set();

export function setVirtualFiles(names: Set<string>) {
  virtualFileNames = names;
}

/**
 * Strips the extension from a filename for loose matching.
 */
function stripExt(name: string) {
  return name.replace(/\.[^/.]+$/, '');
}

/**
 * Resolves a relative import like './App' to a virtual filename like 'App.jsx'
 */
function resolveVirtualImport(importPath: string): string | null {
  // strip './'
  const bare = importPath.replace(/^\.\//, '');

  // Direct match
  if (virtualFileNames.has(bare)) return bare;

  // Match without extension
  const match = Array.from(virtualFileNames).find((name) => stripExt(name) === bare);
  if (match) return match;

  return null;
}

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // ── 1. Root entry file ────────────────────────────────────────────────
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // ── 2. Relative imports → check virtual files first ──────────────────
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        const virtualName = resolveVirtualImport(args.path);
        if (virtualName) {
          return { path: virtualName, namespace: 'virtual' };
        }

        // Fall back to resolving as a remote URL (for nested npm pkg imports)
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
        };
      });

      // ── 3. Absolute npm package imports → unpkg ──────────────────────────
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
