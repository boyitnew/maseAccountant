const https = require('https');
const fs = require('fs');
const path = require('path');

const FONT_DIR = path.join(__dirname, '..', 'src', 'assets', 'fonts');
const FONT_URL = 'https://github.com/rastikerdar/vazirmatn/releases/download/v33.003/Vazirmatn-Variable.ttf';
const FONT_PATH = path.join(FONT_DIR, 'Vazirmatn-Variable.ttf');

if (!fs.existsSync(FONT_DIR)) {
  fs.mkdirSync(FONT_DIR, { recursive: true });
}

if (fs.existsSync(FONT_PATH)) {
  console.log('✓ Vazirmatn font already downloaded.');
  process.exit(0);
}

console.log('Downloading Vazirmatn font...');
const file = fs.createWriteStream(FONT_PATH);
https.get(FONT_URL, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✓ Vazirmatn font downloaded successfully!');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✓ Vazirmatn font downloaded successfully!');
    });
  }
}).on('error', (err) => {
  fs.unlink(FONT_PATH, () => {});
  console.error('✗ Failed to download font:', err.message);
  console.log('Please download manually from: https://github.com/rastikerdar/vazirmatn/releases');
});
