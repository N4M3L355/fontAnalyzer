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
        width: 200,
        height: 200,
        channels: 4,
      }});
  }
  console.log("koberec");
  globalCanvas.png().toFile(`commong.png`);

})

let globalCanvas = sharp({
  create: {
    width: 200,
    height: 200,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})

composites = [];
let drawFonts = async (fonts) => {
  return Promise.all(fonts.map(async (font, index) => {
    if(index>200) return;
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    ctx.textAlign = "center";
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.textBaseline = "middle";
    ctx.font = `120px ${crc32(font).toString(16)}`
    ctx.fillText("g", 100, 100)

    let trimmed = await sharp(canvas.toBuffer(), {failOnError: false}).trim()
    let result = await trimmed.png().toBuffer({ resolveWithObject: true }).catch((e) => {
      console.log(e, font);
    });
    if (!result) return
    await fs.writeFile(`export/${crc32(font).toString(16)}.png`, (result).data);

    composites[index] = {
      input: result.data,
      blend: "xor",
      info: result.info,
      top: Math.floor(100-result.info.height/2),
      left: Math.floor(100-result.info.width/2)
    }
  }))
}
