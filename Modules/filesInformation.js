const fs = require('fs').promises;

/**
 * Lee un archivo JSON desde la ruta indicada.
 * @param {string} filePath - Ruta absoluta o relativa del archivo.
 * @returns {Promise<object>} Contenido parseado del archivo.
 * @throws {Error} Si ocurre un problema al leer o parsear el JSON.
 */
const readJSONFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error al leer el archivo JSON: ${error.message}`);
    }
}

module.exports = { readJSONFile };

