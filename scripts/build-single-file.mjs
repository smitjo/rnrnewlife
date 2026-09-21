#!/usr/bin/env node
/**
 * Bundles the production build into one self-contained HTML file.
 *
 * Useful for hosts that can only serve a single document — a static preview
 * link, an email attachment, a page embedded in another site's CMS. Everything
 * (CSS, JS, icon) is inlined, so the file has no external requests at all and
 * works from a `file://` URL.
 *
 *   npm run build:single            # -> dist-single/rnr-book-app.html
 *   npm run build:single -- --embed # omit <html>/<head>/<body> for hosts that
 *                                   # supply their own document skeleton
 */
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const embed = process.argv.includes('--embed')
const outDir = join(root, 'dist-single')
const outFile = join(outDir, embed ? 'rnr-book-app.embed.html' : 'rnr-book-app.html')

const TITLE = 'RnR New Life · ห้องสมุดหนังสือ'

console.log('Building…')
execFileSync('npx', ['vite', 'build'], {
  cwd: root,
  stdio: 'inherit',
  // The service worker and manifest are dropped in this build: a single file
  // has nowhere to serve them from, and registration would 404.
  env: { ...process.env, VITE_SINGLE_FILE: '1' },
})

const assetDir = join(root, 'dist/assets')
const assets = await readdir(assetDir)

const cssFile = assets.find((f) => f.endsWith('.css'))
const jsFile = assets.find((f) => f.endsWith('.js'))
if (!cssFile || !jsFile) throw new Error('Expected one .css and one .js in dist/assets')

const css = await readFile(join(assetDir, cssFile), 'utf8')
const js = await readFile(join(assetDir, jsFile), 'utf8')
const icon = await readFile(join(root, 'public/icon.svg'), 'utf8')
const iconHref = `data:image/svg+xml,${encodeURIComponent(icon)}`

// `</script>` anywhere in the bundle would close the inline tag early.
const safeJs = js.replace(/<\/script/gi, '<\\/script')

const styles = `<style>\n${css}\n</style>`
const app = `<div id="root"></div>\n<script type="module">\n${safeJs}\n</script>`

const html = embed
  ? `<title>${TITLE}</title>\n${styles}\n${app}`
  : `<!doctype html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#0f766e" />
<link rel="icon" href="${iconHref}" />
<title>${TITLE}</title>
${styles}
</head>
<body>
${app}
</body>
</html>`

await mkdir(outDir, { recursive: true })
await writeFile(outFile, html, 'utf8')

const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
console.log(`\nWrote ${outFile} (${kb} KB, no external requests)`)
