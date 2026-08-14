#!/usr/bin/env node
// Minimal chromium-cli-like REPL driver for TrivialPoursuit, built on Playwright.
// Use this when the `chromium-cli` tool is not on PATH (e.g. this Windows box).
//
// Reads commands from stdin, one per line:
//   nav <url>
//   wait-for text=<substring> | <css-selector>       (default timeout 10s)
//   click <css-selector-or-text=...>
//   fill <selector> <text...>
//   press <key>
//   screenshot [name]
//   eval <js-expression>
//   console-errors
//   sleep <ms>
//   quit
//
// Screenshots land in .claude/skills/run-trivialpoursuit/screenshots/
import { chromium } from 'playwright'
import { createInterface } from 'node:readline'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shotDir = path.join(__dirname, 'screenshots')
mkdirSync(shotDir, { recursive: true })

const consoleErrors = []
let shotCounter = 0

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(String(err)))

function resolveSelector(sel) {
  if (sel.startsWith('text=')) return `text=${sel.slice(5)}`
  return sel
}

async function run(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const [cmd, ...rest] = trimmed.split(' ')
  const arg = rest.join(' ')
  try {
    switch (cmd) {
      case 'nav':
        await page.goto(arg, { waitUntil: 'domcontentloaded' })
        console.log(`OK nav ${arg}`)
        break
      case 'wait-for':
        await page.waitForSelector(resolveSelector(arg), { timeout: 10000 })
        console.log(`OK wait-for ${arg}`)
        break
      case 'click':
        await page.click(resolveSelector(arg), { timeout: 10000 })
        console.log(`OK click ${arg}`)
        break
      case 'click-nth': {
        const [sel, idx] = rest
        await page.locator(resolveSelector(sel)).nth(Number(idx)).click({ timeout: 10000 })
        console.log(`OK click-nth ${sel} ${idx}`)
        break
      }
      case 'fill': {
        const [sel, ...text] = rest
        await page.fill(resolveSelector(sel), text.join(' '), { timeout: 10000 })
        console.log(`OK fill ${sel}`)
        break
      }
      case 'press':
        await page.keyboard.press(arg)
        console.log(`OK press ${arg}`)
        break
      case 'screenshot': {
        shotCounter += 1
        const name = arg || `shot-${String(shotCounter).padStart(2, '0')}`
        const file = path.join(shotDir, `${name}.png`)
        await page.screenshot({ path: file })
        console.log(`OK screenshot ${file}`)
        break
      }
      case 'eval': {
        const result = await page.evaluate(arg)
        console.log(`OK eval ${JSON.stringify(result)}`)
        break
      }
      case 'console-errors':
        console.log(`OK console-errors ${JSON.stringify(consoleErrors)}`)
        break
      case 'sleep':
        await new Promise((r) => setTimeout(r, Number(arg) || 500))
        console.log(`OK sleep ${arg}`)
        break
      case 'quit':
        await browser.close()
        process.exit(0)
        break
      default:
        console.log(`ERR unknown command: ${cmd}`)
    }
  } catch (err) {
    console.log(`ERR ${cmd}: ${err.message.split('\n')[0]}`)
  }
}

let queue = Promise.resolve()
const rl = createInterface({ input: process.stdin })
rl.on('line', (line) => {
  queue = queue.then(() => run(line))
})
rl.on('close', async () => {
  await queue
  if (browser.isConnected()) await browser.close()
  process.exit(0)
})
