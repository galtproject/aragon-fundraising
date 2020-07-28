const truffle = require('@aragon/os/truffle-config')

const gasLimit = 7e6 - 1

truffle.solc.optimizer.runs = 100
truffle.networks.rpc.gas = gasLimit
truffle.networks.devnet.gas = gasLimit
truffle.networks.rinkeby.gas = gasLimit
truffle.networks.rinkeby.gasPrice = 2000000001
truffle.networks.ropsten.gas = gasLimit
truffle.networks.kovan.gas = gasLimit
truffle.networks.frame = {
  host: 'localhost',
  port: '1248',
  network_id: '*',
  gas: gasLimit,
  gasPrice: 2000000001,
}

module.exports = truffle
