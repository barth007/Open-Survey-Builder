import { debugEnabled } from '@/setupDebug'

export function debugLog(...args: any[]) {
  if (debugEnabled) {
    console.log(...args)
  }
}

export function debugWarn(...args: any[]) {
  if (debugEnabled) {
    console.warn(...args)
  }
}
