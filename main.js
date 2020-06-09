const { crc32 } = require('crc');
const fs = require('fs').promises
var glob = require("glob");
const { createCanvas, loadImage, registerFont } = require('canvas')
const sharp = require('sharp');
const {compare} = require("./compare");
let fonts;
let letters = "aegGqiMnQR"
let data = require("./data.json");

let limit = 4000;
saveData =(async () => {
  try {
    await fs.writeFile('./data.json', JSON.stringify(data, null, 2)); // need to be in an async function
    process.exit();
  } catch (error) {
    console.log(error)
  }
})

process.on('SIGINT', function () {
  console.log("Cleaning up, saving");
  return saveData();
});

console.log(data);

const deFlat = (array, n) => array.filter((_, i) => (i % n) === 0).map((_, i) => array.slice(i * n, i * n + n));

glob("googlefonts/fonts/ofl/**/*.ttf", async (err, files) => {
  fonts = files;
  files.forEach(font => {
    registerFont(font, {family: crc32(font).toString(16)});
  })
  await drawFonts(fonts);
  index = 0;
  console.log("starting analysis");
  /*while(true){
    await Promise.all(Array(256).fill(0).map(async () =>{
      let a = Math.floor(composites.length*Math.random());
      let b = Math.floor(composites.length*Math.random());
      if(data[crc32(composites[a].name).toString(16)+crc32(composites[b].name).toString(16)]) {
        if(index>composites.length*composites.length) {
          await saveData();
          process.exit(0)
        }
        index++;
      }
      else{
        index=0;
        return compare(composites[a].image,composites[b].image).then(ai => {
          //console.log(ai, crc32(composites[a].name).toString(16)+crc32(composites[b].name).toString(16));
          data[crc32(composites[a].name).toString(16)+crc32(composites[b].name).toString(16)] = ai.toFixed(3);
        })
      }
    }))
    console.log(`${Object.keys(data).length / (limit * limit) * 100}%`)
  }*/
})
/*
  composites.map(ci => {
    composites.map(async cj => {
      if(ci===cj) return;

      Math.random()<0.03&&compare(ci.image,cj.image,crc32(`${ci.name}${cj.name}`)).then(c => {
        if(c>0){
          console.log(c,ci.name, cj.name);
        }
      });
    })
  })
  console.log("koberec");

})
*/
let globalCanvas = sharp({
  create: {
    width: 8000,
    height: 4500,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
let compositeIndex = 0;
let counter = 0;
composites = [];
let drawFonts = async (fonts) => {
  return Promise.all(fonts.map(async (font, index) => {
    if (index > limit) return;
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `120px ${crc32(font).toString(16)}`
    ctx.fillText("g", 100, 100)

    let trimmed = await sharp(canvas.toBuffer(), {failOnError: false}).trim()
    let result = await trimmed.png().toBuffer().catch((e) => {
      console.log(e, font);
    });
    if (!result) return
    //await fs.writeFile(`export/${crc32(font).toString(16)}.png`, (result).data);
    composites.push({
      name: font,
      image: sharp(result)
    })
  }))
}


/*
fs.readdir("./googlefonts/fonts/ofl").then(fonts =>{
  fonts.forEach(async (font) =>{
    let result;
    if ((await fs.readdir(`./googlefonts/fonts/ofl/${font}`)).includes("static")){
      fs.readdir(`./googlefonts/fonts/ofl/${font}/static`).then(variants => variants.forEach(variant => {
        if
      }))
      result = `./googlefonts/fonts/ofl/${font}/static/${font.charAt(0).toUpperCase() + font.slice(1)}-Regular.ttf`
    }
    else result = `./googlefonts/fonts/ofl/${font}/${font.charAt(0).toUpperCase() + font.slice(1)}-Regular.ttf`
    registerFont(result, {family: font});
    console.log(result);
  })
});*/
