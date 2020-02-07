/**
 * Tokens addresses on main and rinkeby networks
 */
const {mainnet, rinkeby} = require('../../../../../config');
export const Tokens = {
  main: {
    DAI: mainnet.defaultTokenAddress,
    ANT: '0x960b236a07cf122663c4303350609a66a7b288c0',
  },
  rinkeby: {
    DAI: rinkeby.defaultTokenAddress,
    ANT: '0x0d5263b7969144a852d58505602f630f9b20239d',
  },
}
