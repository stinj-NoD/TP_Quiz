import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ICONS_DIR = path.join(ROOT, 'public', 'icons')

async function main() {
  await sharp(path.join(__dirname, 'icon-source.svg')).resize(192, 192).png().toFile(
    path.join(ICONS_DIR, 'icon-192.png'),
  )
  await sharp(path.join(__dirname, 'icon-source.svg')).resize(512, 512).png().toFile(
    path.join(ICONS_DIR, 'icon-512.png'),
  )
  await sharp(path.join(__dirname, 'icon-source-maskable.svg')).resize(512, 512).png().toFile(
    path.join(ICONS_DIR, 'icon-maskable-512.png'),
  )
  // Favicon
  await sharp(path.join(__dirname, 'icon-source.svg')).resize(48, 48).png().toFile(
    path.join(ROOT, 'public', 'favicon.png'),
  )
  console.log('Icônes générées dans public/icons/ et public/favicon.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
