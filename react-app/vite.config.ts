import { defineConfig } from 'vitest/config'
import type { Connect, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Web-only starter: no Electron plugins referenced.
export default defineConfig(async () => {
  const checker = (await import('vite-plugin-checker')).default

  // Inline plugin: restart dev server when dependency manifests change (Vite v5 compatible)
  const restartOnDepsChange = (): Plugin => ({
    name: 'restart-on-deps-change',
    configureServer(server) {
      const configDir = path.dirname(fileURLToPath(import.meta.url))

      const files = [
        'vite.config.ts',
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
      ].map(f => path.resolve(configDir, f))

      server.watcher.add(files)
      const handler = (changedPath: string) => {
        const abs = path.resolve(changedPath)
        if (files.includes(abs)) server.restart()
      }
      server.watcher.on('change', handler)
      server.watcher.on('add', handler)
      server.watcher.on('unlink', handler)
    },
  })

  // Dynamic site.webmanifest from env (dev + build)
  type PackageMeta = { name?: string; description?: string }

  const readPackageMeta = (): PackageMeta => {
    try {
      return createRequire(import.meta.url)('./package.json') as PackageMeta
    } catch {
      // package.json 缺失时回落到默认名，不影响开发服务启动。
      return {}
    }
  }

  const dynamicManifest = (): Plugin => ({
    name: 'dynamic-manifest',
    configureServer(server) {
      const pkg = readPackageMeta()
      const appName = process.env.VITE_APP_NAME || pkg.name || 'App'
      const appDescription = process.env.VITE_APP_DESCRIPTION || pkg.description || ''
      const manifest = buildManifest(appName, appDescription)

      server.middlewares.use((req: Connect.IncomingMessage, res, next: Connect.NextFunction) => {
        if (req.url === '/site.webmanifest') {
          res.setHeader('Content-Type', 'application/manifest+json')
          res.end(JSON.stringify(manifest))
          return
        }
        next()
      })
    },
    generateBundle() {
      const pkg = readPackageMeta()
      const appName = process.env.VITE_APP_NAME || pkg.name || 'App'
      const appDescription = process.env.VITE_APP_DESCRIPTION || pkg.description || ''
      const manifest = buildManifest(appName, appDescription)
      this.emitFile({ type: 'asset', fileName: 'site.webmanifest', source: JSON.stringify(manifest, null, 2) })
    },
  })

  function buildManifest(name: string, description: string) {
    return {
      name,
      short_name: name,
      description,
      icons: [
        { src: '/img/favicon/16x16.png', sizes: '16x16', type: 'image/png' },
        { src: '/img/favicon/32x32.png', sizes: '32x32', type: 'image/png' },
        { src: '/img/favicon/180x180.png', sizes: '180x180', type: 'image/png' },
        { src: '/img/favicon/192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/img/favicon/512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#000000'
    }
  }

  // rIDE: Explicit src alias path for both resolve and vitest test.alias
  const srcPath = fileURLToPath(new URL('./src', import.meta.url))

  return {
    build: { outDir: 'dist' },
    plugins: [
      react(),
      tailwindcss(),
      tsConfigPaths(),
      restartOnDepsChange(),
      dynamicManifest(),
      checker({ typescript: true }),
    ],
    resolve: {
      alias: {
        '@': srcPath,
        '@/': `${srcPath}/`,
      },
    },
    server: { port: 3000 },
    test: {
      alias: { '@/': `${srcPath}/` },
      environment: 'jsdom',
      include: ['**/*.test.*', '**/*.spec.*'],
      globals: true,
      setupFiles: ['./setup-tests.ts'],
    },
  }
})
