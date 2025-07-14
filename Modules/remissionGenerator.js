const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const generateRemission = async (data, templateName, pdfPath) => {
    // Asegurarse que el directorio existe
    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = mustache.render(template, data);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Args para correr en servidores/contenedores
    });
    const page = await browser.newPage();
    
    // Para poder usar archivos locales como el logo en el HTML
    await page.goto(`file://${path.resolve(__dirname, '..')}`);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });

    await browser.close();

    return pdfPath;
};

module.exports = { generateRemission };
