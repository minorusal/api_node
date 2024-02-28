const jwt = require('jsonwebtoken');

const sumaDosNumeros = async (numA, numB) => {
    try {
        console.log(numA, numB);
        return numA + numB;
    } catch (error) {
        throw new Error(`Error al realizar la suma: ${error.message}`);
    }
}

const validaToken = async (token) => {
    try {
        const secretKey = '4RC542024L3v4n74m13n70';
        const dataToken =  await jwt.verify(token, secretKey);
        return dataToken
    } catch (error) {
        throw new Error(`Error al realizar procesamiento de token: ${error.message}`);
    }
}

module.exports = { sumaDosNumeros, validaToken };

