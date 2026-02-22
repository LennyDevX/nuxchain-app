import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary to catch wagmi/transaction errors
 * Prevents ugly red technical error screens
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a transaction error we want to handle gracefully
    if (
      error.message?.includes('User rejected') ||
      error.message?.includes('User denied') ||
      error.message?.includes('Transaction failed')
    ) {
      return { hasError: true, error };
    }
    // For other errors, re-throw to show normal error handling
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console but don't show UI for transaction errors
    console.log('[ErrorBoundary] Transaction error caught:', error.message);
    console.log('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Return null to render nothing - toast notification handles the UX
      return null;
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
