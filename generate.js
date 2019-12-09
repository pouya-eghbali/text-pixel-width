const { getFonts } = require('font-list-universal')
const puppeteer = require('puppeteer')
const { slugify } = require('./utils')
const fs = require('fs')

const pageContent = `
  <!doctype html>
  <html>
    <head><meta charset='UTF-8'><title>Test</title></head>
    <body>
      <pre><div id="char"></div></pre>
    </body>
  </html>
`

const getPixels = fonts => {
  const pixels = {}
  const div = document.getElementById('char')
  const chars = 'abcdefghijklmnopqrstuvwxyz'
    + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()
    + '0123456789'
    + '~!@#$%^&*()_+ '
    + '{}[]-=\\;:\'"?/.>,<`'
  div.style.display = 'inline-block'
  div.style.fontSize = '16px'
  for (const font of fonts) {
    pixels[font] = {}
    div.style.fontFamily = `"${font}"`
    for (const char of chars) {
      div.innerText = char
      const { width } = window.getComputedStyle(div)
      pixels[font][char] = Number(width.replace(/px$/, ''))
    }
  }
  return pixels
}

async function calculate() {
  const fonts = await getFonts()
  const extra = ['freebsd', 'netbsd', 'openbsd'].includes(process.platform) ?
    { executablePath: '/usr/local/bin/chrome' } : {}
  const browser = await puppeteer.launch({ defaultViewport: null, ...extra })
  const pages = await browser.pages()
  const page = pages.pop()
  await page.setContent(pageContent)
  const pixels = await page.evaluate(getPixels, fonts)
  await browser.close()
  return pixels
}

const save = pixels => {
  for (const font in pixels) {
    const slug = slugify(font)
    const data = JSON.stringify(pixels[font])
    fs.writeFileSync(`./fonts/${slug}.json`, data, { encoding: 'utf8' })
  }
}

calculate().then(save)