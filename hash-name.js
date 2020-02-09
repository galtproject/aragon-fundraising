var namehash = require('eth-ens-namehash');
const config = require('./config.js');
console.log('fundraisingName', config.fundraisingName);
console.log('fundraisingName hash', namehash.hash(config.fundraisingName));