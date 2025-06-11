const axios = require('axios');

/**
 * Consume la API pública de países.
 * @returns {Promise<object[]>} Arreglo con la información de los países.
 * @throws {Error} Si ocurre un problema al realizar la petición HTTP.
 */
const consumeApi = async () => {
    try {
        const response = await axios.get('https://restcountries.com/v3/all');
        return response.data;
    } catch (error) {
        throw new Error(`Error al consumir la api publica: ${error.message}`);
    }
}

module.exports = { consumeApi };

