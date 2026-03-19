import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Optional custom fallback — defaults to the built-in card */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return { hasError: true, message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in dev console only
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="text-5xl">📻</span>
          <div>
            <p className="text-base font-semibold text-[var(--sea-ink)]">Something went wrong</p>
            <p className="mt-1 max-w-sm text-sm text-[var(--sea-ink-soft)]">
              {this.state.message}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="rounded-xl bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
