const {crc32} = require('crc');
const fs = require('fs').promises
var glob = require("glob");
const {createCanvas, loadImage, registerFont} = require('canvas')
const sharp = require('sharp');
let compare;
/*

(async () => {

  let pics = [];

  pics[0] = await sharp("./export/1a692b90.png")
  pics[1] = await sharp("./export/1a221001.png")
  pics[2] = await sharp("./export/1ac4c6b2.png")
  pics[3] = await sharp("./export/1aaf872d.png")
  pics[4] = await sharp("./export/1b4d8a90.png")
*/

  compare = async (pic1, pic2, what) => {
    //ok so we want to resize smaller to bigger
    //console.log(pic1, pic2);
    pic1 = pic1.clone();
    pic2 = pic2.clone();

    let size1 = (({width, height}) => width * height)(await pic1.metadata());
    let size2 = (({width, height}) => width * height)(await pic2.metadata());

    let smaller = size1 < size2 ? pic1 : pic2;
    let bigger = size1 >= size2 ? pic1 : pic2;

    let metadata = (await bigger.clone().metadata());
    //metadata.channels var is probably going to be source of bugs, as it behaved suspiciously during devel

    let stats = await sharp(
      await sharp(
        await smaller
          .clone()
          .resize({
            width: metadata.width,
            height: metadata.height,
            fit: "fill"
          })
          .toBuffer(), metadata)
        .boolean(await bigger.clone().toBuffer(),"eor")
        .toBuffer(), metadata)
      //.toFile(what+".png")
      .stats()


    return 1 - stats.channels[3].mean / 255

  }



module.exports =  {compare};

/*
for(let i in pics){
  for(let j in pics){
    console.log(await compare(pics[i],pics[j], `${i}${j}` ), `${i}${j}`)
  }
}


})()*/