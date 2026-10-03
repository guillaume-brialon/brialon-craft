import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const ROOT = import.meta.dirname
const BASE = '/craft/'

// Dépôt du site, cloné à côté de celui-ci : reçoit le build et fournit les styles communs
const SITE = resolve(ROOT, process.env.SITE_DIR ?? '../brialon.com/www')
const SITE_ASSETS = resolve(SITE, 'assets')

// Un outil = un dossier de src/tools/ et une page seule du même nom
const TOOLS = ['countdown', 'quordle', 'chrono', 'coffee', 'footprint', 'scrambler', 'facts', 'detector']

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

/**
 * En développement, /assets/* (site.css, polices, site.js, dictionnaire) est servi depuis le site voisin ;
 * au build, ces liens restent tels quels et pointent vers le site en ligne
 */
const siteAssets = (): Plugin => {
  return {
    name: 'site-assets',
    // Vite préfixe les liens absolus du HTML par la base : on rend /assets/ au site
    // (le code des outils, lui, sort dans /craft/app/)
    transformIndexHtml: {
      order: 'post',
      handler: html => html.replaceAll(`${BASE}assets/`, '/assets/'),
    },
    configureServer(server) {
      // Adresses des pages seules, comme les réécrit le .htaccess du site : /<outil> et /to/<minutes>
      server.middlewares.use((req, _res, next) => {
        const [path, query = ''] = (req.url ?? '').split(/(?=\?)/)
        const tool = /^\/([a-z-]+)\/?$/.exec(path)?.[1]
        if (tool && TOOLS.includes(tool)) req.url = `${BASE}${tool}/index.html${query}`
        else if (/^\/to(\/\d+)?\/?$/.test(path)) req.url = `${BASE}countdown/index.html${query}`
        next()
      })
      server.middlewares.use('/assets', (req, res, next) => {
        const path = decodeURIComponent((req.url ?? '').split('?')[0])
        const file = resolve(SITE_ASSETS, '.' + path)
        if (!file.startsWith(SITE_ASSETS + sep) || !existsSync(file) || !statSync(file).isFile()) return next()
        res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
        createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), siteAssets()],
  build: {
    outDir: resolve(SITE, 'craft'),
    emptyOutDir: true,
    assetsDir: 'app',
    rolldownOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        ...Object.fromEntries(TOOLS.map(tool => [tool, resolve(ROOT, tool, 'index.html')])),
      },
    },
  },
})
