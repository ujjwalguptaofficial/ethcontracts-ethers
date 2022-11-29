if (process.env.NODE_ENV === 'production') {
    module.exports = require('./ethcontracts-web3.commonjs2.min.js');
}
else {
    module.exports = require('./ethcontracts-web3.commonjs2.js');
}
