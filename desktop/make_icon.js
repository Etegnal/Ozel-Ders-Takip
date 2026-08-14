const { Jimp } = require('jimp');
const path = require('path');

const srcPath = path.join(__dirname, '../public/logo.png');
const destPath = path.join(__dirname, '../public/logo_square.png');

console.log('Reading source image from:', srcPath);

Jimp.read(srcPath)
  .then(image => {
    console.log(`Original image: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // Create a 512x512 transparent background canvas
    const bg = new Jimp({ width: 512, height: 512, color: 0x00000000 });
    
    // Calculate coordinates to center the original image on the 512x512 canvas
    const x = Math.floor((512 - image.bitmap.width) / 2);
    const y = Math.floor((512 - image.bitmap.height) / 2);
    
    console.log(`Centering original logo at: x=${x}, y=${y}`);
    
    // Composite the original image onto the background
    bg.composite(image, x, y);
    
    // Save the resulting image
    return bg.write(destPath);
  })
  .then(() => {
    console.log('Successfully created square logo at:', destPath);
  })
  .catch(err => {
    console.error('Error processing logo image:', err);
  });
