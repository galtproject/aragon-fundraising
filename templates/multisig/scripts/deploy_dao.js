const Template = artifacts.require('FundraisingMultisigTemplate')

const { getEventArgument } = require('@aragon/test-helpers/events')

const HOURS = 3600
const DAYS = 24 * 3600
const WEEKS = 7 * DAYS
const PPM = 1e6

const { orgName, orgBoardMembers, orgBoardTokenName, orgBoardTokenSymbol, orgShareTokenName, orgShareTokenSymbol } = require('../../../config');

const BOARD_VOTE_DURATION = DAYS
const BOARD_SUPPORT_REQUIRED = 66e16
const BOARD_MIN_ACCEPTANCE_QUORUM = 66e16
const BOARD_VOTING_SETTINGS = [BOARD_SUPPORT_REQUIRED, BOARD_MIN_ACCEPTANCE_QUORUM, BOARD_VOTE_DURATION]

const SHARE_VOTE_DURATION = WEEKS
const SHARE_SUPPORT_REQUIRED = 51e16
const SHARE_MIN_ACCEPTANCE_QUORUM = 20e16
const SHARE_VOTING_SETTINGS = [SHARE_SUPPORT_REQUIRED, SHARE_MIN_ACCEPTANCE_QUORUM, SHARE_VOTE_DURATION]

const PRESALE_GOAL = 100000e18
const PRESALE_EXCHANGE_RATE = 1000000
// const PRESALE_PERIOD = 14 * DAYS
const PRESALE_PERIOD = 2592000
// const VESTING_CLIFF_PERIOD = 90 * DAYS
const VESTING_CLIFF_PERIOD = 3456000
// const VESTING_COMPLETE_PERIOD = 360 * DAYS
const VESTING_COMPLETE_PERIOD = 7776000
const PERCENT_SUPPLY_OFFERED = 1000000
const PERCENT_FUNDING_FOR_BENEFICIARY = 150000

const MAXIMUM_TAP_RATE_INCREASE_PCT = 5 * Math.pow(10, 17)
const MAXIMUM_TAP_FLOOR_DECREASE_PCT = 5 * Math.pow(10, 17)

const VIRTUAL_SUPPLIES = [2054434690031883720600000, 2054434690031883720600000];
const VIRTUAL_BALANCES = [130443469003188372060000, 13044346900318837206000];
const RESERVE_RATIOS = [100000, 10000];
const RATE = 115740740740740741;
const FLOOR = 100000000000000000000000;
const SLIPPAGES = [50000000000000000, 1000000000000000000];
const BATCH_BLOCKS = 1;

// http://localhost:8080/#/rinkeby-a/extensions/eth-toolbox/tx/0x052a1490cb1ed2df19acd0d7d96e042ed8c0ef80dabf21951e7bc922d238690d
// http://localhost:8080/#/rinkeby-a/extensions/eth-toolbox/tx/0x57c1d424336143e3a56fa0961c4b666646d73402533a18661851580a2733708f
// http://localhost:8080/#/rinkeby-a/extensions/eth-toolbox/tx/0x44577b17702d72f5ae005f3d3da4dabca2041d87aadad1390ab77aa8f01e6143
// http://localhost:8080/#/rinkeby-a/extensions/eth-toolbox/tx/0x1e4572b20ab2fab5181e5ed193c0405a4d2d8303663b9dbf4ba6717ea12ce91d

console.log('module.exports');
module.exports = async callback => {
  console.log('template');
  try {
    const template = await Template.at(process.argv[6])

    // console.log('prepareInstance');
    // const receipt = await template.prepareInstance(orgBoardTokenName, orgBoardTokenSymbol, orgBoardMembers, BOARD_VOTING_SETTINGS, 0, { gasPrice: 3000000001, nonce: 8 })
    // console.log('installShareApps');
    // await template.installShareApps(orgShareTokenName, orgShareTokenSymbol, SHARE_VOTING_SETTINGS, { gasPrice: 3000000001 })
    // console.log('installFundraisingApps');
    // await template.installFundraisingApps(
    //   PRESALE_GOAL,
    //   PRESALE_PERIOD,
    //   PRESALE_EXCHANGE_RATE,
    //   VESTING_CLIFF_PERIOD,
    //   VESTING_COMPLETE_PERIOD,
    //   PERCENT_SUPPLY_OFFERED,
    //   PERCENT_FUNDING_FOR_BENEFICIARY,
    //   0,
    //   BATCH_BLOCKS,
    //   MAXIMUM_TAP_RATE_INCREASE_PCT,
    //   MAXIMUM_TAP_FLOOR_DECREASE_PCT,
    //   { gasPrice: 3000000001 }
    // );

    console.log('setupFundraisingPermissions');
    await template.setupFundraisingPermissions();
    console.log('finalizeInstance');
    await template.finalizeInstance(orgName, VIRTUAL_SUPPLIES, VIRTUAL_BALANCES, SLIPPAGES, RATE, FLOOR, { gasPrice: 3000000001, gas: 9500000 })
    // const dao = getEventArgument(receipt, 'DeployDao', 'dao')
    // console.log('DAO deployed at ' + dao, orgName)
  } catch (err) {
    console.log(err)
  }

  callback()
}
