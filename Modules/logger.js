function log(...args) {
  if (process.env.LOGGING === 'true') {
    console.log(...args);
  }
}

module.exports = { log };
