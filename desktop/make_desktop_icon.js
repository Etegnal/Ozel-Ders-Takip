const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const srcPath = path.join(__dirname, '../public/logo_square.png');
const destPng = path.join(__dirname, 'icon.png');
const destIco = path.join(__dirname, 'icon.ico');

if (fs.existsSync(destIco)) {
  fs.unlinkSync(destIco);
}

Jimp.read(srcPath)
  .then(image => {
    image.resize({ w: 512, h: 512 });
    return image.write(destPng);
  })
  .then(() => {
    console.log('Successfully written 512x512 icon.png');
  })
  .catch(err => {
    console.error('Error creating PNG icon:', err);
  });
