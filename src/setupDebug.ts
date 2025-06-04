const debugEnabled = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true'

if (!debugEnabled) {
  console.log = () => {}
  console.warn = () => {}
}

export { debugEnabled }

