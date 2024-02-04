const fs = require('fs').promises;

const readJSONFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error al leer el archivo JSON: ${error.message}`);
    }
}

module.exports = { readJSONFile };

