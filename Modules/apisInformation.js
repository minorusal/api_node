const axios = require('axios');

const consumeApi = async () => {
    try {
        const response = await axios.get('https://restcountries.com/v3/all');
        return response.data;
    } catch (error) {
        throw new Error(`Error al consumir la api publica: ${error.message}`);
    }
}

module.exports = { consumeApi };

