const { crc32 } = require('crc');
const fs = require('fs').promises
var glob = require("glob");
const { createCanvas, loadImage, registerFont } = require('canvas')
const sharp = require('sharp');
let fonts;

const deFlat = (array, n) => array.filter((_, i) => (i % n) === 0).map((_, i) => array.slice(i * n, i * n + n));

glob("googlefonts/fonts/ofl/**/*.ttf", async (err, files) => {
  fonts = files;
  files.forEach(font => {
    registerFont(font, {family: crc32(font).toString(16)});
  })
  await drawFonts(fonts);
  let index = 0;
  for await (let comp of deFlat(composites,128)) {

    console.log(index++)
    let x = await globalCanvas.composite(comp.filter(x=>x)).raw().toBuffer();
    globalCanvas = await sharp(x, {
      raw: {
        width: 8000,
        height: 4500,
        channels: 4,
      }});
  }
  console.log("koberec");
  globalCanvas.png().toFile(`afab.png`);

})

let globalCanvas = sharp({
  create: {
    width: 8000,
    height: 4500,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})

composites = [];
let drawFonts = async (fonts) => {
  return Promise.all(fonts.map(async (font, index) => {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `120px ${crc32(font).toString(16)}`
    let text = "All.fonts.are.beautiful."
    ctx.fillText(text[index%text.length], 100, 100)

    let trimmed = await sharp(canvas.toBuffer(), {failOnError: false}).trim()
    let result = await trimmed.png().toBuffer({ resolveWithObject: true }).catch((e) => {
      console.log(e, font);
    });
    if (!result) return
    await fs.writeFile(`export/${crc32(font).toString(16)}.png`, (result).data);
    composites[index] = {
      input: result.data,
      top: Math.round(Math.floor(index / 80) * 100 + 50-result.info.height/2),
      left: Math.round((index % 80) * 100 + 50- result.info.width/2)
    }
  }))
}
