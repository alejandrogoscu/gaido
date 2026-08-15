import {
  RiAndroidFill,
  RiAppleFill,
  RiComputerFill,
  RiGamepadFill,
  RiPlaystationFill,
  RiSteamFill,
  RiSwitchFill,
  RiWindowsFill,
  RiXboxFill,
} from '@remixicon/react'

import type { GamePlatform } from './types'

export function PlatformLogo({ platform }: { platform: GamePlatform }) {
  const identifier =
    `${platform.name} ${platform.abbreviation ?? ''}`.toLowerCase()

  if (identifier.includes('playstation') || /\bps[1-5]\b/.test(identifier)) {
    return <RiPlaystationFill aria-hidden="true" />
  }
  if (identifier.includes('xbox')) {
    return <RiXboxFill aria-hidden="true" />
  }
  if (identifier.includes('switch')) {
    return <RiSwitchFill aria-hidden="true" />
  }
  if (identifier.includes('windows') || /\bpc\b/.test(identifier)) {
    return <RiWindowsFill aria-hidden="true" />
  }
  if (identifier.includes('mac') || /\bios\b/.test(identifier)) {
    return <RiAppleFill aria-hidden="true" />
  }
  if (identifier.includes('steam')) {
    return <RiSteamFill aria-hidden="true" />
  }
  if (identifier.includes('android')) {
    return <RiAndroidFill aria-hidden="true" />
  }
  if (identifier.includes('linux')) {
    return <RiComputerFill aria-hidden="true" />
  }

  return <RiGamepadFill aria-hidden="true" />
}