import { ChainId } from '@sushiswap/chain'
import { Amount, Token, Type } from '@sushiswap/currency'
import { Chef, useMasterChef } from '@sushiswap/wagmi'
import { FC, ReactNode, useMemo } from 'react'

import { useTokenAmountDollarValues, useUnderlyingTokenBalanceFromPair } from '../lib/hooks'

interface StakedPositionFetcherRenderProps {
  value0: number
  value1: number
  underlying0: Amount<Token> | undefined
  underlying1: Amount<Token> | undefined
  isLoading: boolean
  isError: boolean
}

export interface StakedPositionFetcherProps {
  chainId: ChainId
  liquidityToken: Token
  totalSupply: Amount<Token>
  reserve0: Amount<Type>
  reserve1: Amount<Type>
  chefType: Chef
  farmId: number
  children(payload: StakedPositionFetcherRenderProps): ReactNode
}

export const StakedPositionFetcher: FC<StakedPositionFetcherProps> = ({
  chainId,
  liquidityToken,
  totalSupply,
  reserve1,
  reserve0,
  chefType,
  farmId,
  children,
}) => {
  const {
    balance: stakedBalance,
    isLoading,
    isError,
  } = useMasterChef({
    chainId: chainId,
    chef: chefType,
    pid: farmId,
    token: liquidityToken,
  })

  const stakedUnderlying = useUnderlyingTokenBalanceFromPair({
    reserve0: reserve0,
    reserve1: reserve1,
    totalSupply,
    balance: stakedBalance,
  })

  const [value0, value1] = useTokenAmountDollarValues({ chainId, amounts: stakedUnderlying })

  return useMemo(() => {
    return (
      <>
        {children({
          value0: Number(value0),
          value1: Number(value1),
          underlying0: stakedUnderlying[0],
          underlying1: stakedUnderlying[1],
          isLoading,
          isError,
        })}
      </>
    )
  }, [children, isError, isLoading, stakedUnderlying, value0, value1])
}
