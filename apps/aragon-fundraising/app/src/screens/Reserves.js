import React, { useEffect, useState } from 'react'
import { Box, Button, Field, GU, Help, Info, SidePanel, Split, TextInput, textStyle, TokenBadge, useLayout, useTheme, IdentityBadge } from '@aragon/ui'
import { useApi, useAppState } from '@aragon/api-react'
import { differenceInMonths } from 'date-fns'
import EditIcon from '../assets/EditIcon.svg'
import DefinitionsBox from '../components/DefinitionsBox'
import { formatBigNumber, fromMonthlyAllocation, toMonthlyAllocation, toDecimals, fromDecimals } from '../utils/bn-utils'
import ValidationError from '../components/ValidationError'

const { defaultTokenSymbol } = require('../../../../../config');

// In this copy we should display the user the percentage of max increase of the tap
const helpContent = [
  [
    'What is the tap rate?',
    `The tap rate defines the amount of ${defaultTokenSymbol} which can be released every month out of the market-maker reserve to the beneficiary of this fundraising campaign.`,
  ],
  [
    'What is the collateralization ratio?',
    'The collateralization ratio defines the ratio between the amount of collateral in your market-maker reserve and the market cap of this fundraising campaign.',
  ],
  [`What is the tap floor?', 'The tap floor defines the amount of ${defaultTokenSymbol} which are kept in the market-maker reserve regardless of the tap rate.`],
]

const ReserveSetting = ({ label, helpContent: [hint, help], value }) => {
  const theme = useTheme()
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        margin-bottom: ${3 * GU}px;
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
        `}
      >
        <span
          css={`
            margin-right: ${1 * GU}px;
            color: ${theme.surfaceContentSecondary};
          `}
        >
          {label}
        </span>
        <Help hint={hint}>{help}</Help>
      </div>
      <p
        css={`
          ${textStyle('body1')};
          font-weight: 600;
        `}
      >
        {value}
      </p>
    </div>
  )
}

export default () => {
  // *****************************
  // background script state
  // *****************************
  const {
    constants: { PPM, PCT_BASE },
    values: { maximumTapRateIncreasePct, maximumTapFloorDecreasePct },
    collaterals: {
      dai: {
        address: daiAddress,
        reserveRatio: daiReserveRatio,
        symbol: daiSymbol,
        decimals: daiDecimals,
        tap: { rate, floor, timestamp },
      },
      ant: { reserveRatio: antReserveRatio, symbol: antSymbol },
    },
    bondedToken: { name, symbol, decimals: tokenDecimals, address, realSupply },
  } = useAppState()

  // *****************************
  // aragon api
  // *****************************
  const api = useApi()

  // *****************************
  // human readable values
  // *****************************
  const adjustedTokenSupply = formatBigNumber(realSupply, tokenDecimals)
  const adjustedRate = toMonthlyAllocation(rate, daiDecimals)
  const displayRate = formatBigNumber(adjustedRate, daiDecimals)
  const displayFloor = formatBigNumber(floor, daiDecimals)
  const adjustedRateIncrease = maximumTapRateIncreasePct.div(PCT_BASE)
  const adjustedFloorDecrease = maximumTapFloorDecreasePct.div(PCT_BASE)
  const displayRateIncrease = formatBigNumber(adjustedRateIncrease.times(100), 0, 0)
  const displayFloorIncrease = formatBigNumber(adjustedFloorDecrease.times(100), 0, 0)
  const daiRatio = formatBigNumber(daiReserveRatio.div(PPM).times(100), 0)
  const antRatio = formatBigNumber(antReserveRatio.div(PPM).times(100), 0)
  const adjustedMaxRate = formatBigNumber(adjustedRate.plus(adjustedRate.times(maximumTapRateIncreasePct).div(PCT_BASE)), daiDecimals)
  const adjustedMinFloor = formatBigNumber(floor.minus(floor.times(maximumTapFloorDecreasePct).div(PCT_BASE)), daiDecimals)

  // *****************************
  // internal state
  // *****************************
  const [newRate, setNewRate] = useState(fromDecimals(adjustedRate, daiDecimals).toFixed(2, 1))
  const [newFloor, setNewFloor] = useState(fromDecimals(floor, daiDecimals).toFixed(2, 1))
  const [errorMessages, setErrorMessages] = useState(null)
  const [valid, setValid] = useState(false)
  const [opened, setOpened] = useState(false)

  // *****************************
  // effects
  // *****************************
  // handle reset when opening
  useEffect(() => {
    if (opened) {
      // reset to default values and validate them
      setNewRate(fromDecimals(adjustedRate, daiDecimals).toFixed(2, 1))
      setNewFloor(fromDecimals(floor, daiDecimals).toFixed(2, 1))
      validate()
    }
  }, [opened])

  // validate when new rate or new floor
  useEffect(() => {
    validate()
  }, [newRate, newFloor])

  // *****************************
  // handlers
  // *****************************
  const handleMonthlyChange = event => {
    setNewRate(event.target.value)
  }

  const handleFloorChange = event => {
    setNewFloor(event.target.value)
  }

  const validate = () => {
    // check if the last rate/floor update is at least one month old
    const atLeastOneMonthOld = timestamp ? differenceInMonths(new Date(), new Date(timestamp)) >= 1 : true

    // RATE RULES
    // check if it's a rate decrease
    const isRateDecrease = fromMonthlyAllocation(newRate, daiDecimals).lte(rate)
    // check if the rate increase respects the max rate increase
    const regularRateIncrease = fromMonthlyAllocation(newRate, daiDecimals).lte(rate.plus(rate.times(adjustedRateIncrease)))
    // updating rate is valid if:
    // - it's a decrease
    // - or it's a regular increase after at least one month since the previous update
    const validRate = isRateDecrease || (regularRateIncrease && atLeastOneMonthOld)

    // FLOOR RULES
    // check if it's a floor increase
    const isFloorIncrease = toDecimals(newFloor, daiDecimals).gte(floor)
    // check if the floor decrease respects the max floor decrease
    const regularFloorDecrease = toDecimals(newFloor, daiDecimals).gte(floor.minus(floor.times(adjustedFloorDecrease)))
    // updating floor is valid if:
    // - it's an increase
    // - or it's a regular decrease after at least one month since the previous update
    const validFloor = isFloorIncrease || (regularFloorDecrease && atLeastOneMonthOld)

    // stack messages for each validation problem
    const errorMessages = []
    if (validRate && validFloor) {
      setErrorMessages(null)
      setValid(true)
    } else if (!atLeastOneMonthOld) {
      if (!validRate) errorMessages.push(`You cannot increase the tap rate more than once per month`)
      if (!validFloor) errorMessages.push(`You cannot decrease the tap floor more than once per month`)
      setErrorMessages(errorMessages)
      setValid(false)
    } else {
      if (!validRate) errorMessages.push(`You cannot increase the tap rate by more than ${displayRateIncrease}%`)
      if (!validFloor) errorMessages.push(`You cannot decrease the tap floor by more than ${displayFloorIncrease}%`)
      setErrorMessages(errorMessages)
      setValid(false)
    }
  }

  /**
   * Calls the `controller.withdraw` smart contarct function on button click
   * @returns {void}
   */
  const handleWithdraw = () => {
    api
      .withdraw(daiAddress)
      .toPromise()
      .catch(console.error)
  }

  const handleSubmit = event => {
    event.preventDefault()
    if (valid) {
      setOpened(false)
      // toFixed(0) returns rounded integers
      const rate = fromMonthlyAllocation(newRate, daiDecimals).toFixed(0)
      const floor = toDecimals(newFloor, daiDecimals).toFixed(0)
      api
        .updateTokenTap(daiAddress, rate, floor)
        .toPromise()
        .catch(console.error)
    }
  }

  const theme = useTheme()
  const { layoutName } = useLayout()

  const editMonthlyAllocationButton = <Button icon={<img src={EditIcon} />} label="Edit monthly allocation" onClick={() => setOpened(true)} />

  return (
    <>
      <Split
        primary={
          <>
            <Box heading="Collateralization ratios">
              <div
                css={`
                  display: grid;
                  grid-column-gap: ${3 * GU}px;
                  grid-template-columns: repeat(${layoutName === 'small' ? '1' : '2'}, 1fr);
                  width: 100%;
                `}
              >
                {[
                  [daiSymbol, daiRatio],
                ].map(([symbol, ratio], i) => (
                  <ReserveSetting
                    key={i}
                    label={`${symbol} collateralization ratio`}
                    helpContent={helpContent[1]}
                    value={
                      <span>
                        {ratio}
                        <span
                          css={`
                            margin-left: ${0.5 * GU}px;
                            color: ${theme.surfaceContentSecondary};
                          `}
                        >
                          %
                        </span>
                      </span>
                    }
                  />
                ))}
              </div>
            </Box>
            <Box heading="Tapped Monthly Allocation">
              <div
                css={`
                  display: grid;
                  grid-column-gap: ${3 * GU}px;
                  grid-template-columns: repeat(${layoutName === 'small' ? '1' : '2'}, 1fr);
                  width: 100%;
                `}
              >
                <ReserveSetting label="Rate" helpContent={helpContent[0]} value={`${displayRate} ${defaultTokenSymbol} / month`} />
                <ReserveSetting label="Floor" helpContent={helpContent[2]} value={`${displayFloor} ${defaultTokenSymbol}`} />
                <Button
                  icon={<img src={EditIcon} />}
                  label="Enact tap"
                  onClick={() => handleWithdraw()}
                  css={`
                    margin-bottom: ${3 * GU}px;
                  `}
                />
                {editMonthlyAllocationButton}
              </div>
            </Box>
          </>
        }
        secondary={
          <DefinitionsBox
            heading="Shares"
            definitions={[
              { label: 'Total Supply', content: <strong>{adjustedTokenSupply}</strong> },
              {
                label: 'Token',
                content: <TokenBadge name={name} symbol={symbol} badgeOnly />,
              },
              { label: 'Address', content: <IdentityBadge entity={address} /> },
            ]}
          />
        }
      />
      <SidePanel opened={opened} onClose={() => setOpened(false)} title="Monthly allocation">
        <form
          onSubmit={handleSubmit}
          css={`
            margin-top: ${3 * GU}px;
          `}
        >
          <Field label={`Rate (${defaultTokenSymbol})`}>
            <TextInput type="number" value={newRate} onChange={handleMonthlyChange} wide required />
          </Field>
          <Field label={`Floor (${defaultTokenSymbol})`}>
            <TextInput type="number" value={newFloor} onChange={handleFloorChange} wide required />
          </Field>
          <Button mode="strong" type="submit" disabled={!valid} wide>
            Save monthly allocation
          </Button>
          {errorMessages?.length > 0 && <ValidationError messages={errorMessages} />}

          <Info
            title="Info"
            css={`
              margin-top: ${2 * GU}px;
            `}
          >
            <p>
              You can increase the rate by <b>{displayRateIncrease}%</b> up to <b>{adjustedMaxRate} {defaultTokenSymbol}</b>.
            </p>
            <p>
              You can decrease the floor by <b>{displayFloorIncrease}%</b> down to <b>{adjustedMinFloor} {defaultTokenSymbol}</b>.
            </p>
          </Info>
          <Info
            mode="warning"
            title="Warning"
            css={`
              margin-top: ${2 * GU}px;
            `}
          >
            You can update either the tap rate or floor only once a month. If you do update the tap rate or floor now{' '}
            <b>you will not be able to update either of them again before a month</b>. Act wisely.
          </Info>
        </form>
      </SidePanel>
    </>
  )
}
