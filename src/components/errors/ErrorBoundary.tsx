import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Error500View } from './Error500View';
import type { ActiveTab } from '../../types';

interface ErrorBoundaryProps {
  children: ReactNode;
  onSelectTab?: (tab: ActiveTab) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorReferenceId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorReferenceId: '',
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    return {
      hasError: true,
      errorReferenceId: `FAULT-${randomHex}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log non-sensitive diagnosis to developer console only
    if (import.meta.env.DEV) {
      console.error('[Lumora ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorReferenceId: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Error500View
          onSelectTab={this.props.onSelectTab || (() => { window.location.pathname = '/'; })}
          onRetry={this.handleRetry}
          errorReferenceId={this.state.errorReferenceId}
        />
      );
    }

    return this.props.children;
  }
}
