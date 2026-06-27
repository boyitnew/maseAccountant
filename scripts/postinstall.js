const fs = require('fs');
const path = require('path');

const svgFile = path.join(__dirname, '..', 'node_modules', 'react-native-svg', 'common', 'cpp', 'react', 'renderer', 'components', 'rnsvg', 'RNSVGLayoutableShadowNode.cpp');
if (fs.existsSync(svgFile)) {
  let content = fs.readFileSync(svgFile, 'utf8');
  if (content.includes('StyleSizeLength')) {
    content = content.replace(/StyleSizeLength/g, 'StyleLength');
    fs.writeFileSync(svgFile, content, 'utf8');
    console.log('patched react-native-svg: StyleSizeLength -> StyleLength');
  }
}
