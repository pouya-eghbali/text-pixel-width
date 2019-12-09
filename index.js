const { slugify, stripAccents } = require('./utils')

const getWidth = (text, font, size = 16) => {
  const ratio = size / 16
  const slug = slugify(font)
  const pixels = require(`./fonts/${slug}.json`)
  let width = 0
  for (const char of stripAccents(text)) {
    const size = pixels[char] || pixels[' ']
    width += size * ratio
  }
  return width
}

module.exports = { getWidth }