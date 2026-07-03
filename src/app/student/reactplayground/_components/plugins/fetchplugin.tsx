import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache',
});

/**
 * Resolves a bare import path to a filename in the virtual file map.
 * Handles extensions like `./App` → `App.jsx`, `./utils` → `utils.ts`, etc.
 */
function resolveVirtualFile(
  importPath: string,
  files: Map<string, string>
): string | null {
  // Strip leading ./
  const bare = importPath.replace(/^\.\//, '');

  // Direct match (e.g. './App.jsx')
  if (files.has(bare)) return bare;

  // Try common extensions
  const exts = ['.jsx', '.tsx', '.js', '.ts', '.css', '.json'];
  for (const ext of exts) {
    const candidate = bare + ext;
    if (files.has(candidate)) return candidate;
  }

  return null;
}

export const fetchPlugin = (files: Map<string, string>) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      // ── 1. Entry point: always resolve from virtual files ───────────────
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        const content =
          files.get('index.jsx') ??
          files.get('index.js') ??
          files.get('index.tsx') ??
          '';
        return {
          loader: 'jsx',
          contents: content,
        };
      });

      // ── 2. Virtual file namespace: serve from in-memory file map ────────
      build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
        const filename = args.path;
        const content = files.get(filename);
        if (content === undefined) return null;

        const ext = filename.split('.').pop() ?? 'js';
        const loaderMap: Record<string, esbuild.Loader> = {
          js: 'jsx',
          jsx: 'jsx',
          ts: 'tsx',
          tsx: 'tsx',
          css: 'css',
          json: 'json',
        };
        const loader: esbuild.Loader = loaderMap[ext] ?? 'jsx';

        // CSS needs to be injected as a style tag since esbuild-wasm 0.8 doesn't
        // support css loader output directly inside bundle.
        if (ext === 'css') {
          const escaped = content
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
          return {
            loader: 'jsx' as esbuild.Loader,
            contents: `
              const style = document.createElement('style');
              style.innerText = "${escaped}";
              document.head.appendChild(style);
            `,
          };
        }

        return { loader, contents: content };
      });

      // ── 3. Cache check for remote files ─────────────────────────────────
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (cachedResult) {
          return cachedResult;
        }
      });

      // ── 4. Remote CSS from unpkg ─────────────────────────────────────────
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);
        return result;
      });

      // ── 5. Remote JS/JSX from unpkg ──────────────────────────────────────
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
