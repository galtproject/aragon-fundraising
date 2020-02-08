const Template = artifacts.require('FundraisingMultisigTemplate')

const { getEventArgument } = require('@aragon/test-helpers/events')

const HOURS = 3600
const DAYS = 24 * 3600
const WEEKS = 7 * DAYS
const PPM = 1e6

const BOARD_MEMBERS = ['0x7be2F6C96F6EFb3B772B5647d324550FCD6b9abF']

const BOARD_TOKEN_NAME = 'Board Token'
const BOARD_TOKEN_SYMBOL = 'BOARD'

const SHARE_TOKEN_NAME = 'Share Token'
const SHARE_TOKEN_SYMBOL = 'SHARE'

const BOARD_VOTE_DURATION = WEEKS
const BOARD_SUPPORT_REQUIRED = 50e16
const BOARD_MIN_ACCEPTANCE_QUORUM = 40e16
const BOARD_VOTING_SETTINGS = [BOARD_SUPPORT_REQUIRED, BOARD_MIN_ACCEPTANCE_QUORUM, BOARD_VOTE_DURATION]

const SHARE_VOTE_DURATION = WEEKS
const SHARE_SUPPORT_REQUIRED = 50e16
const SHARE_MIN_ACCEPTANCE_QUORUM = 5e16
const SHARE_VOTING_SETTINGS = [SHARE_SUPPORT_REQUIRED, SHARE_MIN_ACCEPTANCE_QUORUM, SHARE_VOTE_DURATION]

const PRESALE_GOAL = 100e18
const PRESALE_EXCHANGE_RATE = 2 * PPM
// const PRESALE_PERIOD = 14 * DAYS
const PRESALE_PERIOD = 4 * HOURS
// const VESTING_CLIFF_PERIOD = 90 * DAYS
const VESTING_CLIFF_PERIOD = 10 * DAYS
// const VESTING_COMPLETE_PERIOD = 360 * DAYS
const VESTING_COMPLETE_PERIOD = 30 * DAYS
const PERCENT_SUPPLY_OFFERED = 0.9 * PPM // 90%
const PERCENT_FUNDING_FOR_BENEFICIARY = 0.25 * PPM // 25%

const MAXIMUM_TAP_RATE_INCREASE_PCT = 5 * Math.pow(10, 17)
const MAXIMUM_TAP_FLOOR_DECREASE_PCT = 5 * Math.pow(10, 17)

const VIRTUAL_SUPPLIES = [Math.pow(10, 23), Math.pow(10, 23)]
const VIRTUAL_BALANCES = [Math.pow(10, 22), Math.pow(10, 22)]
const RESERVE_RATIOS = [100000, 10000]
const RATE = 5 * Math.pow(10, 15)
const FLOOR = Math.pow(10, 21)
const SLIPPAGES = [2 * Math.pow(10, 17), Math.pow(10, 18)]
const BATCH_BLOCKS = 1

const { orgName } = require('../../../config');

module.exports = async callback => {
  try {
    const template = await Template.at(process.argv[6])

    console.log('prepareInstance');
    const receipt = await template.prepareInstance(BOARD_TOKEN_NAME, BOARD_TOKEN_SYMBOL, BOARD_MEMBERS, BOARD_VOTING_SETTINGS, 0, { gasPrice: 1000000001 })
    console.log('installShareApps');
    await template.installShareApps(SHARE_TOKEN_NAME, SHARE_TOKEN_SYMBOL, SHARE_VOTING_SETTINGS, { gasPrice: 1000000001 })
    console.log('installFundraisingApps');
    await template.installFundraisingApps(
      PRESALE_GOAL,
      PRESALE_PERIOD,
      PRESALE_EXCHANGE_RATE,
      VESTING_CLIFF_PERIOD,
      VESTING_COMPLETE_PERIOD,
      PERCENT_SUPPLY_OFFERED,
      PERCENT_FUNDING_FOR_BENEFICIARY,
      0,
      BATCH_BLOCKS,
      MAXIMUM_TAP_RATE_INCREASE_PCT,
      MAXIMUM_TAP_FLOOR_DECREASE_PCT,
      { gasPrice: 1000000001, gas: 9500000 }
    );

    console.log('setupFundraisingPermissions');
    await template.setupFundraisingPermissions();
    console.log('finalizeInstance');
    await template.finalizeInstance(orgName, VIRTUAL_SUPPLIES, VIRTUAL_BALANCES, SLIPPAGES, RATE, FLOOR, { gasPrice: 1000000001, gas: 9500000 })
    const dao = getEventArgument(receipt, 'DeployDao', 'dao')
    console.log('DAO deployed at ' + dao, orgName)
  } catch (err) {
    console.log(err)
  }

  callback()
}
