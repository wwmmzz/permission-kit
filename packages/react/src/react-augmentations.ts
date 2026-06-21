export {}

declare module 'react' {
  // Keep the generic name aligned with @types/react's declaration.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    permission?: string | readonly string[]
    permissionMode?: 'hidden' | 'disabled'
  }
}
