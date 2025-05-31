export default function warning(condition: boolean, message: string): void {
  if (!condition && process.env.NODE_ENV !== 'production') {
    if (typeof console !== 'undefined') {
      console.error(`Warning: ${message}`)
    }
    try {
      throw new Error(`Warning: ${message}`)
    } catch (e) { }
  }
} 