function numeroALetras(num) {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirUnidades(n) {
    return unidades[n];
  }

  function convertirDecenas(n) {
    if (n < 10) return convertirUnidades(n);
    if (n >= 10 && n < 20) {
      switch (n) {
        case 10: return 'DIEZ';
        case 11: return 'ONCE';
        case 12: return 'DOCE';
        case 13: return 'TRECE';
        case 14: return 'CATORCE';
        case 15: return 'QUINCE';
        default: return 'DIECI' + convertirUnidades(n - 10);
      }
    }
    if (n >= 20 && n < 30) {
      if (n === 20) return 'VEINTE';
      return 'VEINTI' + convertirUnidades(n - 20);
    }
    const d = Math.floor(n / 10);
    const u = n % 10;
    let palabra = decenas[d - 1];
    if (u > 0) palabra += ' Y ' + convertirUnidades(u);
    return palabra;
  }

  function convertirCentenas(n) {
    if (n === 100) return 'CIEN';
    const c = Math.floor(n / 100);
    const resto = n % 100;
    let palabra = '';
    if (c > 0) palabra = centenas[c];
    if (resto > 0) palabra += (palabra ? ' ' : '') + convertirDecenas(resto);
    return palabra;
  }

  function seccion(n, divisor, singular, plural) {
    const cantidad = Math.floor(n / divisor);
    const resto = n - cantidad * divisor;
    let palabra = '';
    if (cantidad > 0)
      palabra = cantidad > 1 ? convertirNumero(cantidad) + ' ' + plural : singular;
    return { palabra, resto };
  }

  function convertirMiles(n) {
    const res = seccion(n, 1000, 'MIL', 'MIL');
    let palabra = res.palabra;
    if (res.resto > 0) palabra += (palabra ? ' ' : '') + convertirCentenas(res.resto);
    return palabra || convertirCentenas(n);
  }

  function convertirMillones(n) {
    const res = seccion(n, 1000000, 'UN MILLON', 'MILLONES');
    let palabra = res.palabra;
    if (res.resto > 0) palabra += (palabra ? ' ' : '') + convertirMiles(res.resto);
    return palabra || convertirMiles(n);
  }

  function convertirNumero(n) {
    if (n === 0) return 'CERO';
    if (n < 100) return convertirDecenas(n);
    if (n < 1000) return convertirCentenas(n);
    if (n < 1000000) return convertirMiles(n);
    return convertirMillones(n);
  }

  const entero = Math.floor(num);
  const decimal = Math.round((num - entero) * 100);
  const letras = convertirNumero(entero);
  const centavos = decimal.toString().padStart(2, '0');
  return `${letras} ${centavos}/100 MX/ M. N.`;
}

module.exports = numeroALetras;
