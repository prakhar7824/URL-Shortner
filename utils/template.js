const fs = require('fs');
const path = require('path');

function renderTemplate(templateName, data = {}) {
  const templatePath = path.join(__dirname, '../frontend/templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key]);
  }
  
  return html;
}

module.exports = { renderTemplate };

