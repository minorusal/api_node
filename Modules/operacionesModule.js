const jwt = require('jsonwebtoken');
const { log } = require('./logger');

/**
 * Suma dos números y retorna el resultado.
 * @param {number} numA - Primer número.
 * @param {number} numB - Segundo número.
 * @returns {Promise<number>} Resultado de la suma.
 * @throws {Error} Si ocurre un problema durante la operación.
 */
const sumaDosNumeros = async (numA, numB) => {
    try {
        log(numA, numB);
        return numA + numB;
    } catch (error) {
        throw new Error(`Error al realizar la suma: ${error.message}`);
    }
}

/**
 * Valida un token JWT utilizando la clave definida en las variables de entorno.
 * @param {string} token - Token JWT a verificar.
 * @returns {Promise<object>} Información decodificada del token.
 * @throws {Error} Si el token es inválido o no puede verificarse.
 */
const validaToken = async (token) => {
    try {
        const secretKey = process.env.OPERACIONES_SECRET;
        const dataToken =  await jwt.verify(token, secretKey);
        return dataToken
    } catch (error) {
        throw new Error(`Error al realizar procesamiento de token: ${error.message}`);
    }
}

module.exports = { sumaDosNumeros, validaToken };

