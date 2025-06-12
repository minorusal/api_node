const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'config', 'remissionStyle.json');
const defaultStyle = {
  headerBackgroundColor: '#f0f0f0',
  headerTextColor: '#000000'
};

function getStyle() {
  if (!fs.existsSync(stylePath)) return defaultStyle;
  try {
    const data = fs.readFileSync(stylePath, 'utf8');
    return { ...defaultStyle, ...JSON.parse(data) };
  } catch (err) {
    return defaultStyle;
  }
}

function saveStyle(newStyle) {
  const style = { ...getStyle(), ...newStyle };
  fs.writeFileSync(stylePath, JSON.stringify(style, null, 2));
  return style;
}

module.exports = { getStyle, saveStyle };
