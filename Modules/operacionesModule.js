
const sumaDosNumeros = async (numA, numB) => {
    try {
        console.log(numA, numB);
        return numA + numB;
    } catch (error) {
        throw new Error(`Error al realizar la suma: ${error.message}`);
    }
}

module.exports = { sumaDosNumeros };

