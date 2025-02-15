'use client'

import { ChainId } from '@sushiswap/chain'
import { Token, tryParseAmount, Type } from '@sushiswap/currency'
import { usePrice } from '@sushiswap/react-query'
import { Button, classNames, SelectIcon, TextField } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui/components/currency'
import { SkeletonBox } from '@sushiswap/ui/components/skeleton'
import { FC, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useAccount } from 'wagmi'

import { useBalanceWeb3 } from '../../../hooks'
import { TokenSelector } from '../../TokenSelector/TokenSelector'
import { BalancePanel } from './BalancePanel'
import { PricePanel } from './PricePanel'

interface CurrencyInputProps {
  id?: string
  disabled?: boolean
  value: string
  onChange?(value: string): void
  currency: Type | undefined
  onSelect?(currency: Type): void
  chainId: ChainId
  className?: string
  loading?: boolean
  usdPctChange?: number
  disableMaxButton?: boolean
  type: 'INPUT' | 'OUTPUT'
  fetching?: boolean
  currencyLoading?: boolean
  currencies?: Record<string, Token>
  allowNative?: boolean
  error?: string
  hidePinnedTokens?: boolean
  hideSearch?: boolean
}

const CurrencyInput: FC<CurrencyInputProps> = ({
  id,
  disabled,
  value,
  onChange,
  currency,
  onSelect,
  chainId,
  className,
  loading,
  usdPctChange,
  disableMaxButton = false,
  type,
  currencyLoading,
  currencies,
  allowNative = true,
  error,
  hidePinnedTokens = false,
  hideSearch = false,
  fetching,
}) => {
  const [localValue, setLocalValue] = useState<string>('')
  const { address } = useAccount()
  const [pending, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const focusInput = useCallback(() => {
    if (disabled) return
    inputRef.current?.focus()
  }, [disabled])

  const { data: balance, isInitialLoading: isBalanceLoading } = useBalanceWeb3({
    chainId,
    account: address,
    currency,
  })

  const { data: price, isInitialLoading: isPriceLoading } = usePrice({
    chainId: currency?.chainId,
    address: currency?.wrapped?.address,
  })

  const _value = useMemo(() => tryParseAmount(value, currency), [value, currency])
  const insufficientBalance = address && type === 'INPUT' && balance && _value && balance.lessThan(_value)

  // If currency changes, trim input to decimals
  useEffect(() => {
    if (currency && onChange && value && value.includes('.')) {
      const [, decimals] = value.split('.')
      if (decimals.length > currency.decimals) {
        onChange((+value).toFixed(currency.decimals))
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency])

  const isLoading = loading || currencyLoading || isBalanceLoading
  const _error = error ? error : insufficientBalance ? 'Exceeds Balance' : undefined

  const _onChange = useCallback(
    (value: string) => {
      setLocalValue(value)
      startTransition(() => {
        onChange?.(value)
      })
    },
    [onChange]
  )

  useEffect(() => {
    if (currency && chainId && currency?.chainId !== chainId) {
      console.error(
        `Selected token chainId not equal to passed chainId, impossible state. Currency chainId: ${currency.chainId}, chainId: ${chainId}`
      )
    }
  }, [currency?.chainId, chainId])

  const selector = useMemo(() => {
    if (!onSelect) return null

    return (
      <TokenSelector
        id={`${id}-token-selector`}
        currencies={currencies}
        selected={currency}
        chainId={chainId}
        onSelect={onSelect}
        includeNative={allowNative}
        hidePinnedTokens={hidePinnedTokens}
        hideSearch={hideSearch}
      >
        <Button
          size="lg"
          variant={currency ? 'secondary' : 'default'}
          id={id}
          type="button"
          className={classNames(currency ? 'pl-2 pr-3 text-xl' : '', '!rounded-full')}
        >
          {currency ? (
            <>
              <div className="w-[28px] h-[28px] mr-0.5">
                <Currency.Icon disableLink currency={currency} width={28} height={28} />
              </div>
              {currency.symbol}
              <SelectIcon />
            </>
          ) : (
            'Select token'
          )}
        </Button>
      </TokenSelector>
    )
  }, [id, onSelect, currencies, currency, chainId, allowNative, hidePinnedTokens, hideSearch])

  return (
    <div
      onClick={focusInput}
      className={classNames(
        _error ? '!bg-red-500/20 !dark:bg-red-900/30' : '',
        'relative space-y-2 overflow-hidden pb-2',
        className
      )}
    >
      <div
        data-state={fetching ? 'active' : 'inactive'}
        className="transition-all data-[state=inactive]:hidden data-[state=active]:block absolute inset-0 overflow-hidden p-4 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_.5s_infinite] before:bg-gradient-to-r before:from-transparent dark:before:via-slate-50/10 before:via-gray-900/[0.07] before:to-transparent"
      />
      <div className="relative flex items-center gap-4">
        <div
          data-state={isLoading ? 'active' : 'inactive'}
          className={classNames(
            'data-[state=inactive]:hidden data-[state=active]:flex',
            'gap-1 items-center justify-between flex-grow h-[44px]'
          )}
        >
          <SkeletonBox className="w-1/2 h-[32px] rounded-lg" />
        </div>
        <div
          data-state={isLoading ? 'inactive' : 'active'}
          className="data-[state=inactive]:hidden data-[state=active]:flex flex-1 items-center"
        >
          <TextField
            testdata-id={`${id}-input`}
            type="number"
            ref={inputRef}
            variant="naked"
            disabled={disabled}
            onValueChange={_onChange}
            value={pending ? localValue : value}
            readOnly={disabled}
            maxDecimals={currency?.decimals}
            data-state={isLoading ? 'inactive' : 'active'}
            className={classNames('p-0 py-1 !text-3xl font-medium')}
          />
        </div>

        {selector}
        {!onSelect ? (
          <div
            id={`${id}-button`}
            className={classNames(
              'flex items-center gap-1 text-xl py-2 pl-2 pr-2 rounded-full font-medium whitespace-nowrap'
            )}
          >
            {currency ? (
              <>
                <div className="w-[28px] h-[28px] mr-0.5">
                  <Currency.Icon disableLink currency={currency} width={28} height={28} />
                </div>
                {currency.symbol}
              </>
            ) : (
              <span className="text-gray-400 dark:text-slate-500">No token selected</span>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-row items-center justify-between h-[36px]">
        <PricePanel
          value={value}
          currency={currency}
          usdPctChange={usdPctChange}
          error={_error}
          loading={isPriceLoading}
          price={price}
        />
        <BalancePanel
          id={id}
          loading={isBalanceLoading}
          chainId={chainId}
          account={address}
          onChange={onChange}
          currency={currency}
          disableMaxButton={disableMaxButton}
          balance={balance}
          type={type}
        />
      </div>
    </div>
  )
}

export { CurrencyInput, type CurrencyInputProps }
