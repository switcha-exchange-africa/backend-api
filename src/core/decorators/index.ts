// ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT
// ERROR_REPORTING_CHANNEL_LINK_PRODUCTION

import { SetMetadata } from "@nestjs/common";



export const isFeeWalletSet = ((tag: 'fee-wallet-set') => SetMetadata('fee-wallet-set', tag))
export const isAuthenticated = (verbosity: 'strict' | 'loose') => SetMetadata('is-authenticated', verbosity)
export const canUseFeature = (feature: string) => SetMetadata('can-use-feature', feature)