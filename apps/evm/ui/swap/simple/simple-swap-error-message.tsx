import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useSlippageTolerance } from '@sushiswap/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  classNames,
  HoverCard,
  HoverCardContent,
  HoverCardPrimitive,
  HoverCardTrigger,
  IconButton,
  Label,
  TextField,
} from '@sushiswap/ui'
import { Collapsible } from '@sushiswap/ui/components/animation/Collapsible'
import { FC, useEffect, useState } from 'react'

export const SimpleSwapErrorMessage: FC<{ isSuccess: boolean; error: Error | null; isLoading: boolean }> = ({
  isSuccess,
  error,
  isLoading,
}) => {
  const [slippageTolerance, setSlippageTolerance] = useSlippageTolerance()
  const [show, setShow] = useState(false)
  const [persistedError, setPersistedError] = useState<Error | null>(error)

  // Need to perform some funky business because wagmi isn't keeping the previous error while its refetching
  useEffect(() => {
    if (error && error.message.includes('Minimal ouput balance violation')) {
      setShow(true)
      setPersistedError(error)
    }

    if (isSuccess) setPersistedError(null)
  }, [error, isSuccess])

  const isSlippageError = Boolean(persistedError)

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <Collapsible open={show}>
        <div className="pt-4">
          <div className="relative rounded-xl overflow-hidden">
            <div
              data-state={isLoading ? 'active' : 'inactive'}
              className="z-10 transition-all data-[state=inactive]:hidden data-[state=active]:block absolute inset-0 overflow-hidden p-4 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_.5s_infinite] before:bg-gradient-to-r before:from-transparent dark:before:via-slate-50/10 before:via-gray-900/[0.07] before:to-transparent"
            />
            <Card>
              <CardHeader>
                <CardTitle
                  className={classNames(isSlippageError ? 'text-red' : 'text-green', 'flex gap-2 items-center')}
                >
                  {isSlippageError ? 'Low slippage' : 'That works!'}
                </CardTitle>
                <CardDescription className={classNames(isSlippageError ? 'text-red' : 'text-green')}>
                  {isSlippageError ? (
                    'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                  ) : (
                    <>
                      Please be aware that with regards to tax tokens, the preferred slippage incorporates the standard
                      slippage value along with the additional tax amount. E.g.: 0.5% slippage + 5% tax = 5.5%
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1">
                    Slippage{' '}
                    <HoverCardTrigger>
                      <InformationCircleIcon width={16} height={16} />
                    </HoverCardTrigger>
                    <HoverCardPrimitive.Portal>
                      <HoverCardContent className="!p-0 max-w-[320px] z-[1080]">
                        <CardHeader>
                          <CardTitle>Slippage</CardTitle>
                          <CardDescription className="prose">
                            <p>
                              Slippage is the difference between the expected value of output from a trade and the
                              actual value due to asset volatility and liquidity depth. If the actual slippage falls
                              outside of the user-designated range, the transaction will revert.
                            </p>
                            <a
                              className="text-blue hover:underline"
                              target="_blank"
                              href="https://www.sushi.com/academy/articles/what-is-slippage-price-impact"
                            >
                              Learn more
                            </a>
                          </CardDescription>
                        </CardHeader>
                      </HoverCardContent>
                    </HoverCardPrimitive.Portal>
                  </Label>
                  <TextField
                    type="percent"
                    value={slippageTolerance}
                    onValueChange={setSlippageTolerance}
                    placeholder="Slippage percentage"
                    id="slippage-tolerance"
                    maxDecimals={1}
                    unit="%"
                  />
                </div>
              </CardContent>
              <div className="absolute right-2 top-2">
                <IconButton icon={XMarkIcon} name="minimize" onClick={() => setShow(false)} size="xs" />
              </div>
            </Card>
          </div>
        </div>
      </Collapsible>
    </HoverCard>
  )
}
